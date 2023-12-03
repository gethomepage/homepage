import { promises as fs } from "fs";
import path from "path";

import yaml from "js-yaml";
import Docker from "dockerode";
import { CustomObjectsApi, NetworkingV1Api } from "@kubernetes/client-node";

import checkAndCopyConfig, { getSettings, CONF_DIR, substituteEnvironmentVars } from "utils/config/config";
import getDockerArguments from "utils/config/docker";
import getKubeConfig from "utils/config/kubernetes";
import { checkCRD, getUrlFromIngress } from "./service-helpers";
import * as shvl from "utils/config/shvl";

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

const getDockerServers = async () => {
  checkAndCopyConfig("docker.yaml");
  const dockerYaml = path.join(CONF_DIR, "docker.yaml");
  const rawDockerFileContents = await fs.readFile(dockerYaml, "utf8");
  const dockerFileContents = substituteEnvironmentVars(rawDockerFileContents);
  return yaml.load(dockerFileContents);
}

const listDockerContainers = async (servers, serverName) => {
  const isSwarm = !!servers[serverName].swarm;
  const docker = new Docker(getDockerArguments(serverName).conn);
  const listProperties = { all: true };
  const containers = await (isSwarm
    ? docker.listbookmarks(listProperties)
    : docker.listContainers(listProperties));

  // bad docker connections can result in a <Buffer ...> object?
  // in any case, this ensures the result is the expected array
  if (!Array.isArray(containers)) {
    return [];
  }
  return containers;
}

const mapObjectsToGroup = (servers, objectName) => {
  const mappedObjectGroups = [];

  servers.forEach((server) => {
    server[objectName].forEach((serverObject) => {
      let serverGroup = mappedObjectGroups.find((searchedGroup) => searchedGroup.name === serverObject.group);
      if (!serverGroup) {
        const gObject = {name: serverObject.group}
        gObject[objectName] = []
        mappedObjectGroups.push(gObject);
        serverGroup = mappedObjectGroups[mappedObjectGroups.length - 1];
      }

      const { name: serverObjectName, group: serverObjectGroup, ...pushedObject } = serverObject;
      const result = {
        name: serverObjectName,
        ...pushedObject,
      };

      serverGroup[objectName].push(result);
    });
  });

  return mappedObjectGroups;

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
              const cleanLabel = label.replace(`homepage.bookmarks.${containerNameNoSlash}.`, "");

              let value = cleanLabel;
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

  const mappedBookmarkGroups = mapObjectsToGroup(bookmarkServers, 'bookmarks');
  return mappedBookmarkGroups;
}


export async function bookmarksFromKubernetes() {
  const ANNOTATION_BASE = "gethomepage.dev";
  const ANNOTATION_WIDGET_BASE = `${ANNOTATION_BASE}/widget.`;

  checkAndCopyConfig("kubernetes.yaml");

  try {
    const kc = getKubeConfig();
    if (!kc) {
      return [];
    }
    const networking = kc.makeApiClient(NetworkingV1Api);
    const crd = kc.makeApiClient(CustomObjectsApi);

    const ingressList = await networking
      .listIngressForAllNamespaces(null, null, null, null)
      .then((response) => response.body)
      .catch((error) => {
        logger.error("Error getting ingresses: %d %s %s", error.statusCode, error.body, error.response);
        return null;
      });

    const traefikContainoExists = await checkCRD(kc, "ingressroutes.traefik.containo.us");
    const traefikExists = await checkCRD(kc, "ingressroutes.traefik.io");

    const traefikIngressListContaino = await crd
      .listClusterCustomObject("traefik.containo.us", "v1alpha1", "ingressroutes")
      .then((response) => response.body)
      .catch(async (error) => {
        if (traefikContainoExists) {
          logger.error(
            "Error getting traefik ingresses from traefik.containo.us: %d %s %s",
            error.statusCode,
            error.body,
            error.response,
          );
        }

        return [];
      });

    const traefikIngressListIo = await crd
      .listClusterCustomObject("traefik.io", "v1alpha1", "ingressroutes")
      .then((response) => response.body)
      .catch(async (error) => {
        if (traefikExists) {
          logger.error(
            "Error getting traefik ingresses from traefik.io: %d %s %s",
            error.statusCode,
            error.body,
            error.response,
          );
        }

        return [];
      });

    const traefikIngressList = [...(traefikIngressListContaino?.items ?? []), ...(traefikIngressListIo?.items ?? [])];

    if (traefikIngressList.length > 0) {
      const traefikbookmarks = traefikIngressList.filter(
        (ingress) => ingress.metadata.annotations && ingress.metadata.annotations[`${ANNOTATION_BASE}/href`],
      );
      ingressList.items.push(...traefikbookmarks);
    }

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
        if (ingress.metadata.annotations[`${ANNOTATION_BASE}/pod-selector`]) {
          constructedBookmark.podSelector = ingress.metadata.annotations[`${ANNOTATION_BASE}/pod-selector`];
        }
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

