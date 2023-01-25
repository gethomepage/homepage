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

  // add default weight to services based on their position in the configuration
  servicesArray.forEach((group, groupIndex) => {
    group.services.forEach((service, serviceIndex) => {
      if(!service.weight) {
        servicesArray[groupIndex].services[serviceIndex].weight = (serviceIndex + 1) * 100;
      }
    });
  });

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
      try {
        const docker = new Docker(getDockerArguments(serverName).conn);
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
      } catch (e) {
        // a server failed, but others may succeed
        return { server: serverName, services: [] };
      }
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
  const urlHost = ingress.spec.rules[0].host;
  const urlPath = ingress.spec.rules[0].http.paths[0].path;
  const urlSchema = ingress.spec.tls ? 'https' : 'http';
  return `${urlSchema}://${urlHost}${urlPath}`;
}

export async function servicesFromKubernetes() {
  const ANNOTATION_BASE = 'gethomepage.dev';
  const ANNOTATION_WIDGET_BASE = `${ANNOTATION_BASE}/widget.`;
  const ANNOTATION_POD_SELECTOR = `${ANNOTATION_BASE}/pod-selector`;

  checkAndCopyConfig("kubernetes.yaml");

  try {
    const kc = getKubeConfig();
    if (!kc) {
      return [];
    }
    const networking = kc.makeApiClient(NetworkingV1Api);

    const ingressList = await networking.listIngressForAllNamespaces(null, null, null, null)
      .then((response) => response.body)
      .catch((error) => {
        logger.error("Error getting ingresses: %d %s %s", error.statusCode, error.body, error.response);
        return null;
      });
    if (!ingressList) {
      return [];
    }
    const services = ingressList.items
      .filter((ingress) => ingress.metadata.annotations && ingress.metadata.annotations[`${ANNOTATION_BASE}/enabled`] === 'true')
      .map((ingress) => {
      const constructedService = {
        app: ingress.metadata.name,
        namespace: ingress.metadata.namespace,
        href: ingress.metadata.annotations[`${ANNOTATION_BASE}/href`] || getUrlFromIngress(ingress),
        name: ingress.metadata.annotations[`${ANNOTATION_BASE}/name`] || ingress.metadata.name,
        group: ingress.metadata.annotations[`${ANNOTATION_BASE}/group`] || "Kubernetes",
        weight: ingress.metadata.annotations[`${ANNOTATION_BASE}/weight`] || '0',
        icon: ingress.metadata.annotations[`${ANNOTATION_BASE}/icon`] || '',
        description: ingress.metadata.annotations[`${ANNOTATION_BASE}/description`] || '',
      };
      if (ingress.metadata.annotations[ANNOTATION_POD_SELECTOR]) {
        constructedService.podSelector = ingress.metadata.annotations[ANNOTATION_POD_SELECTOR];
      }
      Object.keys(ingress.metadata.annotations).forEach((annotation) => {
        if (annotation.startsWith(ANNOTATION_WIDGET_BASE)) {
          shvl.set(constructedService, annotation.replace(`${ANNOTATION_BASE}/`, ""), ingress.metadata.annotations[annotation]);
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
      if (typeof service.weight === 'string') {
        const weight = parseInt(service.weight, 10);
        if (Number.isNaN(weight)) {
          cleanedService.weight = 0;
        } else {
          cleanedService.weight = weight;
        }
      }
      if (typeof cleanedService.weight !== "number") {
        cleanedService.weight = 0;
      }

      if (cleanedService.widget) {
        // whitelisted set of keys to pass to the frontend
        const {
          type, // all widgets
          fields,
          server, // docker widget
          container,
          currency, // coinmarketcap widget
          symbols,
          defaultinterval,
          namespace, // kubernetes widget
          app,
          podSelector,
          wan // opnsense widget
        } = cleanedService.widget;

        const fieldsList = typeof fields === 'string' ? JSON.parse(fields) : fields;

        cleanedService.widget = {
          type,
          fields: fieldsList || null,
          service_name: service.name,
          service_group: serviceGroup.name,
        };

        if (currency) cleanedService.widget.currency = currency;
        if (symbols) cleanedService.widget.symbols = symbols;
        if (defaultinterval) cleanedService.widget.defaultinterval = defaultinterval;

        if (type === "docker") {
          if (server) cleanedService.widget.server = server;
          if (container) cleanedService.widget.container = container;
        }
        if (type === "kubernetes") {
          if (namespace) cleanedService.widget.namespace = namespace;
          if (app) cleanedService.widget.app = app;
          if (podSelector) cleanedService.widget.podSelector = podSelector;
        }
        if (type === "opnsense") {
          if (wan) cleanedService.widget.wan = wan;
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
