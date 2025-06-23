import path from "path";
import fs from "fs";

import yaml from "js-yaml";
import Docker from "dockerode";

import checkAndCopyConfig, {CONF_DIR, getSettings, substituteEnvironmentVars} from "../config";
import getDockerArguments from "../docker";
import * as shvl from "../shvl";
import createLogger from "../../logger";

const logger = createLogger("service-helpers");

export async function servicesFromDocker() {
  checkAndCopyConfig("docker.yaml");

  const dockerYaml = path.join(CONF_DIR, "docker.yaml");
  const rawDockerFileContents = await fs.promises.readFile(dockerYaml, "utf8");
  const dockerFileContents = substituteEnvironmentVars(rawDockerFileContents);
  const servers = yaml.load(dockerFileContents);

  if (!servers) {
    return [];
  }

  const { instanceName } = getSettings();

  const serviceServers = await Promise.all(
    Object.keys(servers).map(async (serverName) => {
      try {
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

        const discovered = [];
        containers.forEach((container) => {
          const generator = createServicesFromContainer(container);
          let result = generator.next();
          while (!result.done) {
            if (result.value !== null) discovered.push(result.value);
            result = generator.next();
          }
        });

        function* createServicesFromContainer(container) {
          let constructedService = null;
          const containerLabels = isSwarm ? shvl.get(container, "Spec.Labels") : container.Labels;
          const containerName = isSwarm ? shvl.get(container, "Spec.Name") : container.Names[0];

          for (const [labelName, labelValue] of Object.entries(containerLabels)) {
            if (!labelName.startsWith("homepage.")) {
              continue;
            }

            let propertyPath = labelName.replace("homepage.", "");
            if (instanceName && propertyPath.startsWith(`instance.${instanceName}.`)) {
              propertyPath = propertyPath.replace(`instance.${instanceName}.`, "");
            } else if (propertyPath.startsWith("instance.")) {
              continue;
            }

            if (!constructedService) {
              constructedService = {
                container: containerName.replace(/^\//, ""),
                server: serverName,
                type: "service",
              };
            }

            let substitutedVal = substituteEnvironmentVars(labelValue);
            if (propertyPath === "widget.version") {
              substitutedVal = parseInt(substitutedVal, 10);
            }

            shvl.set(constructedService, propertyPath, substitutedVal);
          }

          const tryCreateService = service => {
            if (service && (!service.name || !service.group) && !service.services) {
              logger.error(
                `Error constructing service using homepage labels for container '${containerName.replace(
                  /^\//,
                  "",
                )}'. Ensure required labels are present.`,
              );
              logger.error(service);
              return null;
            }

            return service;
          }

          if (constructedService && constructedService.services) {
            for (const service of constructedService.services) {
              const resultingService = structuredClone(constructedService);
              delete resultingService.services;
              yield tryCreateService(Object.assign(resultingService, service));
            }
            return;
          }

          yield tryCreateService(constructedService);
        }

        return { server: serverName, services: discovered.filter((filteredService) => filteredService) };
      } catch (e) {
        logger.error("Error getting services from Docker server '%s': %s", serverName, e);

        // a server failed, but others may succeed
        return { server: serverName, services: [] };
      }
    }),
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
