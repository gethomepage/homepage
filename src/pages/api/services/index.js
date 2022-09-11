/* eslint-disable no-console */
import { servicesFromConfig, servicesFromDocker, cleanServiceGroups } from "utils/service-helpers";

export default async function handler(req, res) {
  let discoveredServices;
  let configuredServices;

  try {
    discoveredServices = cleanServiceGroups(await servicesFromDocker());
  } catch {
    console.error("Failed to discover services, please check docker.yaml for errors");
    discoveredServices = [];
  }

  try {
    configuredServices = cleanServiceGroups(await servicesFromConfig());
  } catch {
    console.error("Failed to load services.yaml, please check for errors");
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

  res.send(mergedGroups);
}
