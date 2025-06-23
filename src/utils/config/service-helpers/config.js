import { promises as fs } from "fs";
import path from "path";

import yaml from "js-yaml";

import createLogger from "../../logger";
import checkAndCopyConfig, { CONF_DIR, substituteEnvironmentVars } from "../config";

const logger = createLogger("service-helpers");

function parseServicesToGroups(services) {
  if (!services) {
    return [];
  }

  // map easy to write YAML objects into easy-to-consume JS arrays
  return services.map((serviceGroup) => {
    const name = Object.keys(serviceGroup)[0];
    let groups = [];
    const serviceGroupServices = [];
    serviceGroup[name].forEach((entries) => {
      const entryName = Object.keys(entries)[0];
      if (!entries[entryName]) {
        logger.warn(`Error parsing service "${entryName}" from config. Ensure required fields are present.`);
        return;
      }
      if (Array.isArray(entries[entryName])) {
        groups = groups.concat(parseServicesToGroups([{ [entryName]: entries[entryName] }]));
      } else {
        serviceGroupServices.push({
          name: entryName,
          ...entries[entryName],
          weight: entries[entryName].weight || serviceGroupServices.length * 100, // default weight
          type: "service",
        });
      }
    });
    return {
      name,
      type: "group",
      services: serviceGroupServices,
      groups,
    };
  });
}

export async function servicesFromConfig() {
  checkAndCopyConfig("services.yaml");

  const servicesYaml = path.join(CONF_DIR, "services.yaml");
  const rawFileContents = await fs.readFile(servicesYaml, "utf8");
  const fileContents = substituteEnvironmentVars(rawFileContents);
  const services = yaml.load(fileContents);
  return parseServicesToGroups(services);
}
