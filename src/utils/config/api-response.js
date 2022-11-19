/* eslint-disable no-console */
import { promises as fs } from "fs";
import path from "path";

import yaml from "js-yaml";

import checkAndCopyConfig, { getSettings } from "utils/config/config";
import {
  servicesFromConfig,
  servicesFromDocker,
  cleanServiceGroups,
  servicesFromKubernetes
} from "utils/config/service-helpers";
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
  let discoveredDockerServices;
  let discoveredKubernetesServices;
  let configuredServices;
  let initialSettings;

  try {
    discoveredDockerServices = cleanServiceGroups(await servicesFromDocker());
  } catch (e) {
    console.error("Failed to discover services, please check docker.yaml for errors or remove example entries.");
    if (e) console.error(e);
    discoveredDockerServices = [];
  }

  try {
    discoveredKubernetesServices = cleanServiceGroups(await servicesFromKubernetes());
  } catch (e) {
    console.error("Failed to discover services, please check kubernetes.yaml for errors or remove example entries.");
    if (e) console.error(e);
    discoveredKubernetesServices = [];
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
    ...new Set([
      discoveredDockerServices.map((group) => group.name),
      discoveredKubernetesServices.map((group) => group.name),
      configuredServices.map((group) => group.name),
    ].flat()),
  ];

  const mergedGroups = [];
  const definedLayouts = initialSettings.layout ? Object.keys(initialSettings.layout) : null;

  mergedGroupsNames.forEach((groupName) => {
    const discoveredDockerGroup = discoveredDockerServices.find((group) => group.name === groupName) || { services: [] };
    const discoveredKubernetesGroup = discoveredKubernetesServices.find((group) => group.name === groupName) || { services: [] };
    const configuredGroup = configuredServices.find((group) => group.name === groupName) || { services: [] };

    const mergedGroup = {
      name: groupName,
      services: [
        ...discoveredDockerGroup.services,
        ...discoveredKubernetesGroup.services,
        ...configuredGroup.services
      ].filter((service) => service),
    };

    if (definedLayouts) {
      const layoutIndex = definedLayouts.findIndex(layout => layout === mergedGroup.name);
      if (layoutIndex > -1) mergedGroups.splice(layoutIndex, 0, mergedGroup);
      else mergedGroups.push(mergedGroup);
    } else {
      mergedGroups.push(mergedGroup);
    }
  });

  return mergedGroups;
}
