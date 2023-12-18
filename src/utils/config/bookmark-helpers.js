import { promises as fs } from "fs";
import path from "path";

import yaml from "js-yaml";

import {
  getDockerServers,
  listDockerContainers,
  mapObjectsToGroup,
  getIngressList,
  ANNOTATION_BASE,
  ANNOTATION_BOOKMARK_BASE,
} from "./integration-helpers";

import createLogger from "utils/logger";
import checkAndCopyConfig, { getSettings, CONF_DIR, substituteEnvironmentVars } from "utils/config/config";
import * as shvl from "utils/config/shvl";

const logger = createLogger("bookmark-helpers");

export async function bookmarksFromConfig() {
  checkAndCopyConfig("bookmarks.yaml");

  const bookmarksYaml = path.join(CONF_DIR, "bookmarks.yaml");
  const rawFileContents = await fs.readFile(bookmarksYaml, "utf8");
  const fileContents = substituteEnvironmentVars(rawFileContents);
  const bookmarks = yaml.load(fileContents);

  if (!bookmarks) return [];

  // map easy to write YAML objects into easy to consume JS arrays
  const bookmarksArray = bookmarks.map((group) => ({
    name: Object.keys(group)[0],
    bookmarks: group[Object.keys(group)[0]].map((entries) => ({
      name: Object.keys(entries)[0],
      ...entries[Object.keys(entries)[0]][0],
    })),
  }));

  return bookmarksArray;
}

export async function bookmarksFromDocker() {
  const servers = await getDockerServers();

  if (!servers) {
    return [];
  }

  const { instanceName } = getSettings();

  const bookmarkServers = await Promise.all(
    Object.keys(servers).map(async (serverName) => {
      try {
        const isSwarm = !!servers[serverName].swarm;
        const containers = await listDockerContainers(servers, serverName);
        const constructed = [];
        containers.forEach((container) => {
          let constructedBookmark = null;
          const containerLabels = isSwarm ? shvl.get(container, "Spec.Labels") : container.Labels;

          Object.keys(containerLabels).forEach((label) => {
            if (label.startsWith("homepage.bookmarks.")) {
              let value = label.replace("homepage.bookmarks.", "");
              const bookmarkKey = value.substring(0, value.indexOf("."));
              value = value.replace(`${bookmarkKey}.`, "");
              if (instanceName && value.startsWith(`instance.${instanceName}.`)) {
                value = value.replace(`instance.${instanceName}.`, "");
              } else if (value.startsWith("instance.")) {
                return;
              }

              if (!constructedBookmark || constructedBookmark.key !== bookmarkKey) {
                constructedBookmark = {
                  type: "bookmark",
                  key: bookmarkKey,
                };
                constructed.push(constructedBookmark);
              }
              shvl.set(constructedBookmark, value, substituteEnvironmentVars(containerLabels[label]));
            }
          });
        });
        return { server: serverName, bookmarks: constructed.filter((filteredBookmark) => filteredBookmark) };
      } catch (e) {
        logger.error(e);
        // a server failed, but others may succeed
        return { server: serverName, bookmarks: [] };
      }
    }),
  );

  return mapObjectsToGroup(bookmarkServers, "bookmarks");
}

export async function bookmarksFromKubernetes() {
  try {
    const ingressList = await getIngressList();

    if (!ingressList) {
      return [];
    }
    const constructed = [];
    ingressList.items
      .filter(
        (ingress) =>
          ingress.metadata.annotations && ingress.metadata.annotations[`${ANNOTATION_BASE}/enabled`] === "true",
      )
      .forEach((ingress) => {
        let constructedBookmark = null;
        Object.keys(ingress.metadata.annotations).forEach((annotation) => {
          if (annotation.startsWith(ANNOTATION_BOOKMARK_BASE)) {
            const trimmedAnnotation = annotation.replace(`${ANNOTATION_BOOKMARK_BASE}.`, "");
            const bookmarkKey = trimmedAnnotation.substring(0, trimmedAnnotation.indexOf("."));

            if (!constructedBookmark || constructedBookmark.key !== bookmarkKey) {
              constructedBookmark = {
                type: "bookmark",
                key: bookmarkKey,
              };
              constructed.push(constructedBookmark);
            }
            shvl.set(
              constructedBookmark,
              annotation.replace(`${ANNOTATION_BOOKMARK_BASE}.${bookmarkKey}.`, ""),
              ingress.metadata.annotations[annotation],
            );
          }
        });

        try {
          constructedBookmark = JSON.parse(substituteEnvironmentVars(JSON.stringify(constructedBookmark)));
        } catch (e) {
          logger.error("Error attempting k8s environment variable substitution.");
        }

        return constructedBookmark;
      });

    const mappedBookmarkGroups = [];

    constructed.forEach((serverBookmark) => {
      let serverGroup = mappedBookmarkGroups.find((searchedGroup) => searchedGroup.name === serverBookmark.group);
      if (!serverGroup) {
        mappedBookmarkGroups.push({
          name: serverBookmark.group,
          bookmarks: [],
        });
        serverGroup = mappedBookmarkGroups[mappedBookmarkGroups.length - 1];
      }

      const { name: bookmarkName, group: serverBookmarkGroup, ...pushedBookmark } = serverBookmark;
      const result = {
        name: bookmarkName,
        ...pushedBookmark,
      };

      serverGroup.bookmarks.push(result);
    });

    return mappedBookmarkGroups;
  } catch (e) {
    logger.error(e);
    throw e;
  }
}
