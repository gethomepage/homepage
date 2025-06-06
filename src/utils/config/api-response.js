/* eslint-disable no-console */
import { promises as fs } from "fs";
import path from "path";

import yaml from "js-yaml";

import checkAndCopyConfig, { CONF_DIR, getSettings, substituteEnvironmentVars } from "utils/config/config";
import {
  cleanServiceGroups,
  findGroupByName,
  servicesFromConfig,
  servicesFromDocker,
  servicesFromKubernetes,
} from "utils/config/service-helpers";
import { cleanWidgetGroups, widgetsFromConfig } from "utils/config/widget-helpers";

/**
 * Compares services by weight then by name.
 */
function compareServices(service1, service2) {
  const comp = service1.weight - service2.weight;
  if (comp !== 0) {
    return comp;
  }
  return service1.name.localeCompare(service2.name);
}

export async function bookmarksResponse() {
  checkAndCopyConfig("bookmarks.yaml");

  const bookmarksYaml = path.join(CONF_DIR, "bookmarks.yaml");
  const rawFileContents = await fs.readFile(bookmarksYaml, "utf8");
  const fileContents = substituteEnvironmentVars(rawFileContents);
  const bookmarks = yaml.load(fileContents);

  if (!bookmarks) return [];

  let initialSettings;

  try {
    initialSettings = await getSettings();
  } catch (e) {
    console.error("Failed to load settings.yaml, please check for errors");
    if (e) console.error(e.toString());
    initialSettings = {};
  }

  // map easy to write YAML objects into easy to consume JS arrays
  const bookmarksArray = bookmarks.map((group) => ({
    name: Object.keys(group)[0],
    bookmarks: group[Object.keys(group)[0]].map((entries) => ({
      name: Object.keys(entries)[0],
      ...entries[Object.keys(entries)[0]][0],
    })),
  }));

  const sortedGroups = [];
  const unsortedGroups = [];
  const definedLayouts = initialSettings.layout ? Object.keys(initialSettings.layout) : null;

  bookmarksArray.forEach((group) => {
    if (definedLayouts) {
      const layoutIndex = definedLayouts.findIndex((layout) => layout === group.name);
      if (layoutIndex > -1) sortedGroups[layoutIndex] = group;
      else unsortedGroups.push(group);
    } else {
      unsortedGroups.push(group);
    }
  });

  return [...sortedGroups.filter((g) => g), ...unsortedGroups];
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

function convertLayoutGroupToGroup(name, layoutGroup) {
  const group = { name, services: [], groups: [] };
  if (layoutGroup) {
    Object.entries(layoutGroup).forEach(([key, value]) => {
      if (typeof value === "object") {
        group.groups.push(convertLayoutGroupToGroup(key, value));
      }
    });
  }
  return group;
}

function mergeSubgroups(configuredGroups, mergedGroup) {
  configuredGroups.forEach((group) => {
    if (group.name === mergedGroup.name) {
      // eslint-disable-next-line no-param-reassign
      group.services = mergedGroup.services;
    } else if (group.groups) {
      mergeSubgroups(group.groups, mergedGroup);
    }
  });
}

function ensureParentGroupExists(sortedGroups, configuredGroups, group, definedLayouts) {
  // make sure the top level parent group exists in the sortedGroups array
  const parentGroupName = group.parent;
  const parentGroup = findGroupByName(configuredGroups, parentGroupName);
  if (parentGroup && parentGroup.parent) {
    ensureParentGroupExists(sortedGroups, configuredGroups, parentGroup);
  } else {
    const parentGroupIndex = definedLayouts.findIndex((layout) => layout === parentGroupName);
    if (parentGroupIndex > -1) {
      sortedGroups[parentGroupIndex] = parentGroup;
    }
  }
}

function pruneEmptyGroups(groups) {
  // remove any groups that have no services
  return groups.filter((group) => {
    if (group.services.length === 0 && group.groups.length === 0) {
      return false;
    }
    if (group.groups.length > 0) {
      group.groups = pruneEmptyGroups(group.groups);
    }
    return true;
  });
}

function mergeLayoutGroupsIntoConfigured(configuredGroups, layoutGroups) {
  for (const layoutGroup of layoutGroups) {
    const existing = findGroupByName(configuredGroups, layoutGroup.name);
    if (existing) {
      if (layoutGroup.groups?.length) {
        existing.groups ??= [];
        for (const sub of layoutGroup.groups) {
          const existingSub = findGroupByName(existing.groups, sub.name);
          if (!existingSub) {
            existing.groups.push(sub);
          } else {
            // recursive merge if needed
            mergeLayoutGroupsIntoConfigured([existingSub], [sub]);
          }
        }
      }
    } else {
      configuredGroups.push(layoutGroup);
    }
  }
}

export async function servicesResponse() {
  let discoveredDockerServices;
  let discoveredKubernetesServices;
  let configuredServices;
  let initialSettings;

  try {
    discoveredDockerServices = cleanServiceGroups(await servicesFromDocker());
    if (discoveredDockerServices?.length === 0) {
      console.debug("No containers were found with homepage labels.");
    }
  } catch (e) {
    console.error("Failed to discover services, please check docker.yaml for errors or remove example entries.");
    if (e) console.error(e.toString());
    discoveredDockerServices = [];
  }

  try {
    discoveredKubernetesServices = cleanServiceGroups(await servicesFromKubernetes());
  } catch (e) {
    console.error("Failed to discover services, please check kubernetes.yaml for errors or remove example entries.");
    if (e) console.error(e.toString());
    discoveredKubernetesServices = [];
  }

  try {
    configuredServices = cleanServiceGroups(await servicesFromConfig());
  } catch (e) {
    console.error("Failed to load services.yaml, please check for errors");
    if (e) console.error(e.toString());
    configuredServices = [];
  }

  try {
    initialSettings = await getSettings();
  } catch (e) {
    console.error("Failed to load settings.yaml, please check for errors");
    if (e) console.error(e.toString());
    initialSettings = {};
  }

  const mergedGroupsNames = [
    ...new Set(
      [
        discoveredDockerServices.map((group) => group.name),
        discoveredKubernetesServices.map((group) => group.name),
        configuredServices.map((group) => group.name),
      ].flat(),
    ),
  ];

  const sortedGroups = [];
  const unsortedGroups = [];
  const definedLayouts = initialSettings.layout ? Object.keys(initialSettings.layout) : null;
  if (definedLayouts) {
    // this handles cases where groups are only defined in the settings.yaml layout and not in the services.yaml
    const layoutGroups = Object.entries(initialSettings.layout).map(([key, value]) =>
      convertLayoutGroupToGroup(key, value),
    );
    mergeLayoutGroupsIntoConfigured(configuredServices, layoutGroups);
  }

  mergedGroupsNames.forEach((groupName) => {
    const discoveredDockerGroup = findGroupByName(discoveredDockerServices, groupName) || {
      services: [],
    };
    const discoveredKubernetesGroup = findGroupByName(discoveredKubernetesServices, groupName) || {
      services: [],
    };
    const configuredGroup = findGroupByName(configuredServices, groupName) || { services: [], groups: [] };

    const mergedGroup = {
      name: groupName,
      services: [...discoveredDockerGroup.services, ...discoveredKubernetesGroup.services, ...configuredGroup.services]
        .filter((service) => service)
        .sort(compareServices),
      groups: [...configuredGroup.groups],
    };

    if (definedLayouts) {
      const layoutIndex = definedLayouts.findIndex((layout) => layout === mergedGroup.name);
      if (layoutIndex > -1) sortedGroups[layoutIndex] = mergedGroup;
      else if (configuredGroup.parent) {
        // this is a nested group, so find the parent group and merge the services
        mergeSubgroups(configuredServices, mergedGroup);
        // make sure the top level parent group exists in the sortedGroups array
        ensureParentGroupExists(sortedGroups, configuredServices, configuredGroup, definedLayouts);
      } else unsortedGroups.push(mergedGroup);
    } else if (configuredGroup.parent) {
      // this is a nested group, so find the parent group and merge the services
      mergeSubgroups(configuredServices, mergedGroup);
    } else {
      unsortedGroups.push(mergedGroup);
    }
  });

  const allGroups = [...sortedGroups.filter((g) => g), ...unsortedGroups];
  return pruneEmptyGroups(allGroups);
}
