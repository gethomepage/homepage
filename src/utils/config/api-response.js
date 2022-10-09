/* eslint-disable no-console */
import { promises as fs } from "fs";
import path from "path";

import yaml from "js-yaml";

import checkAndCopyConfig, { getSettings } from "utils/config/config";
import { servicesFromConfig, servicesFromDocker, cleanServiceGroups } from "utils/config/service-helpers";
import { cleanWidgetGroups, widgetsFromConfig } from "utils/config/widget-helpers";

export async function bookmarksResponse() {
  checkAndCopyConfig("bookmarks.yaml");

  const bookmarksYaml = path.join(process.cwd(), "config", "bookmarks.yaml");
  const fileContents = await fs.readFile(bookmarksYaml, "utf8");
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

export async function widgetsResponse() {
  let configuredWidgets;

  try {
    configuredWidgets = cleanWidgetGroups(await widgetsFromConfig());
  } catch (e) {
    console.error("Failed to load widgets, please check widgets.yaml for errors or remove example entries.");
    if (e) console.error(e);
    configuredWidgets = [];
  }

  return configuredWidgets;
}

export async function servicesResponse() {
  let discoveredServices;
  let configuredServices;
  let initialSettings;

  try {
    discoveredServices = cleanServiceGroups(await servicesFromDocker());
  } catch (e) {
    console.error("Failed to discover services, please check docker.yaml for errors or remove example entries.");
    if (e) console.error(e);
    discoveredServices = [];
  }

  try {
    configuredServices = cleanServiceGroups(await servicesFromConfig());
  } catch (e) {
    console.error("Failed to load services.yaml, please check for errors");
    if (e) console.error(e);
    configuredServices = [];
  }

  try {
    initialSettings = await getSettings();
  } catch (e) {
    console.error("Failed to load settings.yaml, please check for errors");
    if (e) console.error(e);
    initialSettings = {};
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

  let sortedServices = [];

  const layouts = Object.keys(initialSettings.layout);
  layouts.forEach((currentServer) => {
    if (initialSettings.layout[currentServer]?.sort) {
      const idx = mergedGroups.findIndex((service) => service.name === currentServer);
      sortedServices.push(...mergedGroups.splice(idx, 1));
    }
  });
  if (mergedGroups.length) {
    sortedServices = sortedServices.concat(mergedGroups);
  }

  return sortedServices;
}
