import { promises as fs } from "fs";
import path from "path";

import yaml from "js-yaml";
import Docker from "dockerode";

import checkAndCopyConfig, { getSettings, CONF_DIR, substituteEnvironmentVars } from "utils/config/config";
import getDockerArguments from "utils/config/docker";
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
    ? docker.listServices(listProperties)
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
