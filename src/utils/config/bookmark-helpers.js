import { promises as fs } from "fs";
import path from "path";

import yaml from "js-yaml";

import {
  getDockerServers,
  listDockerContainers,
  getUrlFromIngress,
  mapObjectsToGroup,
  getIngressList,
  ANNOTATION_BASE,
  ANNOTATION_WIDGET_BASE,
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
        const discovered = containers.map((container) => {
          let constructedBookmark = null;
          const containerLabels = isSwarm ? shvl.get(container, "Spec.Labels") : container.Labels;
          const containerName = isSwarm ? shvl.get(container, "Spec.Name") : container.Names[0];

          Object.keys(containerLabels).forEach((label) => {
            if (label.startsWith("homepage.bookmarks.")) {
              const containerNameNoSlash = containerName.replace(/^\//, "");

              let value = label.replace(`homepage.bookmarks.${containerNameNoSlash}.`, "");
              if (instanceName && value.startsWith(`instance.${instanceName}.`)) {
                value = value.replace(`instance.${instanceName}.`, "");
              } else if (value.startsWith("instance.")) {
                return;
              }

              if (!constructedBookmark) {
                constructedBookmark = {
                  container: containerNameNoSlash,
                  server: serverName,
                  type: "bookmark",
                };
              }
              shvl.set(constructedBookmark, value, substituteEnvironmentVars(containerLabels[label]));
            }
          });

          return constructedBookmark;
        });

        return { server: serverName, bookmarks: discovered.filter((filteredBookmark) => filteredBookmark) };
      } catch (e) {
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
    const bookmarks = ingressList.items
      .filter(
        (ingress) =>
          ingress.metadata.annotations && ingress.metadata.annotations[`${ANNOTATION_BASE}/enabled`] === "true",
      )
      .map((ingress) => {
        let constructedBookmark = {
          app: ingress.metadata.annotations[`${ANNOTATION_BASE}/app`] || ingress.metadata.name,
          namespace: ingress.metadata.namespace,
          href: ingress.metadata.annotations[`${ANNOTATION_BASE}/href`] || getUrlFromIngress(ingress),
          name: ingress.metadata.annotations[`${ANNOTATION_BASE}/name`] || ingress.metadata.name,
          group: ingress.metadata.annotations[`${ANNOTATION_BASE}/group`] || "Kubernetes",
          icon: ingress.metadata.annotations[`${ANNOTATION_BASE}/icon`] || "",
          description: ingress.metadata.annotations[`${ANNOTATION_BASE}/description`] || "",
          type: "bookmark",
        };
        Object.keys(ingress.metadata.annotations).forEach((annotation) => {
          if (annotation.startsWith(ANNOTATION_WIDGET_BASE)) {
            shvl.set(
              constructedBookmark,
              annotation.replace(`${ANNOTATION_BASE}/`, ""),
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

    bookmarks.forEach((serverBookmark) => {
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
