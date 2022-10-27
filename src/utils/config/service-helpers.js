import { promises as fs } from "fs";
import path from "path";

import yaml from "js-yaml";
import Docker from "dockerode";
import * as shvl from "shvl";
import { NetworkingV1Api } from "@kubernetes/client-node";

import createLogger from "utils/logger";
import checkAndCopyConfig from "utils/config/config";
import getDockerArguments from "utils/config/docker";
import getKubeConfig from "utils/config/kubernetes";

const logger = createLogger("service-helpers");

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
          if (label.startsWith("homepage.")) {
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

function getUrlFromIngress(ingress) {
  let url = ingress.metadata.annotations['homepage/url'];
  if(!url) {
    const urlHost = ingress.spec.rules[0].host;
    const urlPath = ingress.spec.rules[0].http.paths[0].path;
    const urlSchema = ingress.spec.tls ? 'https' : 'http';

    url = `${urlSchema}://${urlHost}${urlPath}`;
  }
  return url;
}

export async function servicesFromKubernetes() {
  checkAndCopyConfig("kubernetes.yaml");

  try {
    const kc = getKubeConfig();
    if (!kc) {
      return [];
    }
    const networking = kc.makeApiClient(NetworkingV1Api);

    const ingressList = await networking.listIngressForAllNamespaces(null, null, null, "homepage/enabled=true")
      .then((response) => response.body)
      .catch((error) => {
        logger.error("Error getting ingresses: %d %s %s", error.statusCode, error.body, error.response);
        return null;
      });
    if (!ingressList) {
      return [];
    }
    const services = ingressList.items.map((ingress) => {
      const constructedService = {
        app: ingress.metadata.name,
        namespace: ingress.metadata.namespace,
        href: getUrlFromIngress(ingress),
        name: ingress.metadata.annotations['homepage/name'] || ingress.metadata.name,
        group: ingress.metadata.annotations['homepage/group'] || "Kubernetes",
        icon: ingress.metadata.annotations['homepage/icon'] || '',
        description: ingress.metadata.annotations['homepage/description'] || ''
      };
      Object.keys(ingress.metadata.annotations).forEach((annotation) => {
        if (annotation.startsWith("homepage/widget/")) {
          shvl.set(constructedService, annotation.replace("homepage/widget/", ""), ingress.metadata.annotations[annotation]);
        }
      });

      return constructedService;
    });

    const mappedServiceGroups = [];

    services.forEach((serverService) => {
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

    return mappedServiceGroups;

  } catch (e) {
    logger.error(e);
    throw e;
  }
}

export function cleanServiceGroups(groups) {
  return groups.map((serviceGroup) => ({
    name: serviceGroup.name,
    services: serviceGroup.services.map((service) => {
      const cleanedService = { ...service };

      if (cleanedService.widget) {
        // whitelisted set of keys to pass to the frontend
        const {
          type, // all widgets
          fields,
          server, // docker widget
          container,
          currency, // coinmarketcap widget
          symbols,
          namespace, // kubernetes widget
          app
        } = cleanedService.widget;

        cleanedService.widget = {
          type,
          fields: fields || null,
          service_name: service.name,
          service_group: serviceGroup.name,
        };

        if (currency) cleanedService.widget.currency = currency;
        if (symbols) cleanedService.widget.symbols = symbols;

        if (type === "docker") {
          if (server) cleanedService.widget.server = server;
          if (container) cleanedService.widget.container = container;
        }
        if (type === "kubernetes") {
          if (namespace) cleanedService.widget.namespace = namespace;
          if (app) cleanedService.widget.app = app;
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

  const kubernetesServices = await servicesFromKubernetes();
  const kubernetesServiceGroup = kubernetesServices.find((g) => g.name === group);
  if (kubernetesServiceGroup) {
    const kubernetesServiceEntry = kubernetesServiceGroup.services.find((s) => s.name === service);
    if (kubernetesServiceEntry) {
      const { widget } = kubernetesServiceEntry;
      return widget;
    }
  }

  return false;
}
