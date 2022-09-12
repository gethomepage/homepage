import { promises as fs } from "fs";
import path from "path";

import yaml from "js-yaml";
import Docker from "dockerode";
import * as shvl from "shvl";

import checkAndCopyConfig from "utils/config";
import getDockerArguments from "utils/docker";

export async function servicesFromConfig() {
  checkAndCopyConfig("services.yaml");

  const servicesYaml = path.join(process.cwd(), "config", "services.yaml");
  const fileContents = await fs.readFile(servicesYaml, "utf8");
  const services = yaml.load(fileContents);

  if (!services) {
    return [];
  }

  // map easy to write YAML objects into easy to consume JS arrays
  const servicesArray = services.map((servicesGroup) => ({
    name: Object.keys(servicesGroup)[0],
    services: servicesGroup[Object.keys(servicesGroup)[0]].map((entries) => ({
      name: Object.keys(entries)[0],
      ...entries[Object.keys(entries)[0]],
    })),
  }));

  return servicesArray;
}

export async function servicesFromDocker() {
  checkAndCopyConfig("docker.yaml");

  const dockerYaml = path.join(process.cwd(), "config", "docker.yaml");
  const dockerFileContents = await fs.readFile(dockerYaml, "utf8");
  const servers = yaml.load(dockerFileContents);

  if (!servers) {
    return [];
  }

  const serviceServers = await Promise.all(
    Object.keys(servers).map(async (serverName) => {
      const docker = new Docker(getDockerArguments(serverName));
      const containers = await docker.listContainers({
        all: true,
      });

      // bad docker connections can result in a <Buffer ...> object?
      // in any case, this ensures the result is the expected array
      if (!Array.isArray(containers)) {
        return [];
      }

      const discovered = containers.map((container) => {
        let constructedService = null;

        Object.keys(container.Labels).forEach((label) => {
          if (label.startsWith("homepage")) {
            if (!constructedService) {
              constructedService = {
                container: container.Names[0].replace(/^\//, ""),
                server: serverName,
              };
            }
            shvl.set(constructedService, label.replace("homepage.", ""), container.Labels[label]);
          }
        });

        return constructedService;
      });

      return { server: serverName, services: discovered.filter((filteredService) => filteredService) };
    })
  );

  const mappedServiceGroups = [];

  serviceServers.forEach((server) => {
    server.services.forEach((serverService) => {
      let serverGroup = mappedServiceGroups.find((searchedGroup) => searchedGroup.name === serverService.group);
      if (!serverGroup) {
        mappedServiceGroups.push({
          name: serverService.group,
          services: [],
        });
        serverGroup = mappedServiceGroups[mappedServiceGroups.length - 1];
      }

      const { name: serviceName, group: serverServiceGroup, ...pushedService } = serverService;
      const result = {
        name: serviceName,
        ...pushedService,
      };

      serverGroup.services.push(result);
    });
  });

  return mappedServiceGroups;
}

export function cleanServiceGroups(groups) {
  return groups.map((serviceGroup) => ({
    name: serviceGroup.name,
    services: serviceGroup.services.map((service) => {
      const cleanedService = { ...service };

      if (cleanedService.widget) {
        const { type, server, container } = cleanedService.widget;

        cleanedService.widget = {
          type,
          service_name: service.name,
          service_group: serviceGroup.name,
        };

        if (type === "docker") {
          cleanedService.widget.server = server;
          cleanedService.widget.container = container;
        }
      }

      return cleanedService;
    }),
  }));
}

export default async function getServiceWidget(group, service) {
  const configuredServices = await servicesFromConfig();

  const serviceGroup = configuredServices.find((g) => g.name === group);
  if (serviceGroup) {
    const serviceEntry = serviceGroup.services.find((s) => s.name === service);
    if (serviceEntry) {
      const { widget } = serviceEntry;
      return widget;
    }
  }

  const discoveredServices = await servicesFromDocker();

  const dockerServiceGroup = discoveredServices.find((g) => g.name === group);
  if (dockerServiceGroup) {
    const dockerServiceEntry = dockerServiceGroup.services.find((s) => s.name === service);
    if (dockerServiceEntry) {
      const { widget } = dockerServiceEntry;
      return widget;
    }
  }

  return false;
}
