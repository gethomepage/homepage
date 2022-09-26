/* eslint-disable no-console */
import { promises as fs } from "fs";
import path from "path";

import yaml from "js-yaml";

import checkAndCopyConfig from "utils/config";
import { servicesFromConfig, servicesFromDocker, cleanServiceGroups } from "utils/service-helpers";

export async function bookmarksResponse() {
  checkAndCopyConfig("bookmarks.yaml");

  const bookmarksYaml = path.join(process.cwd(), "config", "bookmarks.yaml");
  const fileContents = await fs.readFile(bookmarksYaml, "utf8");
  const bookmarks = yaml.load(fileContents);

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

export async function widgetsResponse() {
  checkAndCopyConfig("widgets.yaml");

  const widgetsYaml = path.join(process.cwd(), "config", "widgets.yaml");
  const fileContents = await fs.readFile(widgetsYaml, "utf8");
  const widgets = yaml.load(fileContents);

  // map easy to write YAML objects into easy to consume JS arrays
  const widgetsArray = widgets.map((group) => ({
    type: Object.keys(group)[0],
    options: { ...group[Object.keys(group)[0]] },
  }));

  return widgetsArray;
}

export async function servicesResponse() {
  let discoveredServices;
  let configuredServices;

  try {
    discoveredServices = cleanServiceGroups(await servicesFromDocker());
  } catch (e) {
    console.error("Failed to discover services, please check docker.yaml for errors or remove example entries.");
    console.error(e);
    discoveredServices = [];
  }

  try {
    configuredServices = cleanServiceGroups(await servicesFromConfig());
  } catch (e) {
    console.error("Failed to load services.yaml, please check for errors");
    console.error(e);
    configuredServices = [];
  }

  const mergedGroupsNames = [
    ...new Set([discoveredServices.map((group) => group.name), configuredServices.map((group) => group.name)].flat()),
  ];

  const mergedGroups = [];

  mergedGroupsNames.forEach((groupName) => {
    const discoveredGroup = discoveredServices.find((group) => group.name === groupName) || { services: [] };
    const configuredGroup = configuredServices.find((group) => group.name === groupName) || { services: [] };

    const mergedGroup = {
      name: groupName,
      services: [...discoveredGroup.services, ...configuredGroup.services].filter((service) => service),
    };

    mergedGroups.push(mergedGroup);
  });

  return mergedGroups;
}
