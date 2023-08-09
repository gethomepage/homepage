import { promises as fs } from "fs";
import path from "path";

import yaml from "js-yaml";
import Docker from "dockerode";
import * as shvl from "shvl";
import { CustomObjectsApi, NetworkingV1Api } from "@kubernetes/client-node";

import createLogger from "utils/logger";
import checkAndCopyConfig, { CONF_DIR, substituteEnvironmentVars } from "utils/config/config";
import getDockerArguments from "utils/config/docker";
import getKubeConfig from "utils/config/kubernetes";

const logger = createLogger("service-helpers");


export async function servicesFromConfig() {
  checkAndCopyConfig("services.yaml");

  const servicesYaml = path.join(CONF_DIR, "services.yaml");
  const rawFileContents = await fs.readFile(servicesYaml, "utf8");
  const fileContents = substituteEnvironmentVars(rawFileContents);
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
      type: 'service'
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

  const dockerYaml = path.join(CONF_DIR, "docker.yaml");
  const rawDockerFileContents = await fs.readFile(dockerYaml, "utf8");
  const dockerFileContents = substituteEnvironmentVars(rawDockerFileContents);
  const servers = yaml.load(dockerFileContents);

  if (!servers) {
    return [];
  }

  const serviceServers = await Promise.all(
    Object.keys(servers).map(async (serverName) => {
      try {
        const isSwarm = !!servers[serverName].swarm;
        const docker = new Docker(getDockerArguments(serverName).conn);
        const listProperties = { all: true };
        const containers = await ((isSwarm) ? docker.listServices(listProperties) : docker.listContainers(listProperties));

        // bad docker connections can result in a <Buffer ...> object?
        // in any case, this ensures the result is the expected array
        if (!Array.isArray(containers)) {
          return [];
        }

        const discovered = containers.map((container) => {
          let constructedService = null;
          const containerLabels = isSwarm ? shvl.get(container, 'Spec.Labels') : container.Labels;
          const containerName = isSwarm ? shvl.get(container, 'Spec.Name') : container.Names[0];

          Object.keys(containerLabels).forEach((label) => {
            if (label.startsWith("homepage.")) {
              if (!constructedService) {
                constructedService = {
                  container: containerName.replace(/^\//, ""),
                  server: serverName,
                  type: 'service'
                };
              }
              shvl.set(constructedService, label.replace("homepage.", ""), substituteEnvironmentVars(containerLabels[label]));
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
    const crd = kc.makeApiClient(CustomObjectsApi);

    const ingressList = await networking.listIngressForAllNamespaces(null, null, null, null)
      .then((response) => response.body)
      .catch((error) => {
        logger.error("Error getting ingresses: %d %s %s", error.statusCode, error.body, error.response);
        return null;
      });

    const traefikIngressList = await crd.listClusterCustomObject("traefik.io", "v1alpha1", "ingressroutes")
      .then((response) => response.body)
      .catch(async (error) => {
        logger.error("Error getting traefik ingresses from traefik.io: %d %s %s", error.statusCode, error.body, error.response);

        // Fallback to the old traefik CRD group
        const fallbackIngressList = await crd.listClusterCustomObject("traefik.containo.us", "v1alpha1", "ingressroutes")
          .then((response) => response.body)
          .catch((fallbackError) => {
            logger.error("Error getting traefik ingresses from traefik.containo.us: %d %s %s", fallbackError.statusCode, fallbackError.body, fallbackError.response);
            return null;
          });

        return fallbackIngressList;
      });

    if (traefikIngressList && traefikIngressList.items.length > 0) {
      const traefikServices = traefikIngressList.items
      .filter((ingress) => ingress.metadata.annotations && ingress.metadata.annotations[`${ANNOTATION_BASE}/href`])
      ingressList.items.push(...traefikServices);
    }

    if (!ingressList) {
      return [];
    }
    const services = ingressList.items
      .filter((ingress) => ingress.metadata.annotations && ingress.metadata.annotations[`${ANNOTATION_BASE}/enabled`] === 'true')
      .map((ingress) => {
      let constructedService = {
        app: ingress.metadata.name,
        namespace: ingress.metadata.namespace,
        href: ingress.metadata.annotations[`${ANNOTATION_BASE}/href`] || getUrlFromIngress(ingress),
        name: ingress.metadata.annotations[`${ANNOTATION_BASE}/name`] || ingress.metadata.name,
        group: ingress.metadata.annotations[`${ANNOTATION_BASE}/group`] || "Kubernetes",
        weight: ingress.metadata.annotations[`${ANNOTATION_BASE}/weight`] || '0',
        icon: ingress.metadata.annotations[`${ANNOTATION_BASE}/icon`] || '',
        description: ingress.metadata.annotations[`${ANNOTATION_BASE}/description`] || '',
        external: false,
        type: 'service'
      };
      if (ingress.metadata.annotations[`${ANNOTATION_BASE}/external`]) {
        constructedService.external = String(ingress.metadata.annotations[`${ANNOTATION_BASE}/external`]).toLowerCase() === "true"
      }
      if (ingress.metadata.annotations[ANNOTATION_POD_SELECTOR]) {
        constructedService.podSelector = ingress.metadata.annotations[ANNOTATION_POD_SELECTOR];
      }
      if (ingress.metadata.annotations[`${ANNOTATION_BASE}/ping`]) {
        constructedService.ping = ingress.metadata.annotations[`${ANNOTATION_BASE}/ping`];
      }
      Object.keys(ingress.metadata.annotations).forEach((annotation) => {
        if (annotation.startsWith(ANNOTATION_WIDGET_BASE)) {
          shvl.set(constructedService, annotation.replace(`${ANNOTATION_BASE}/`, ""), ingress.metadata.annotations[annotation]);
        }
      });

      try {
        constructedService = JSON.parse(substituteEnvironmentVars(JSON.stringify(constructedService)));
      } catch (e) {
        logger.error("Error attempting k8s environment variable substitution.");
      }

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
      if (cleanedService.showStats !== undefined) cleanedService.showStats = JSON.parse(cleanedService.showStats);
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
          hideErrors,
          server, // docker widget
          container,
          currency, // coinmarketcap widget
          symbols,
          slugs,
          defaultinterval,
          site, // unifi widget
          namespace, // kubernetes widget
          app,
          podSelector,
          wan, // opnsense widget, pfsense widget
          enableBlocks, // emby/jellyfin
          enableNowPlaying,
          volume, // diskstation widget,
          enableQueue, // sonarr/radarr
          node, // Proxmox
          snapshotHost, // kopia
          snapshotPath,
          userEmail, // azuredevops
          repositoryId,
          metric, // glances
          stream, // mjpeg
          fit,
        } = cleanedService.widget;

        let fieldsList = fields;
        if (typeof fields === 'string') {
          try { JSON.parse(fields) }
          catch (e) {
            logger.error("Invalid fields list detected in config for service '%s'", service.name);
            fieldsList = null;
          }
        }

        cleanedService.widget = {
          type,
          fields: fieldsList || null,
          hide_errors: hideErrors || false,
          service_name: service.name,
          service_group: serviceGroup.name,
        };

        if (type === "azuredevops") {
          if (userEmail) cleanedService.widget.userEmail = userEmail;
          if (repositoryId) cleanedService.widget.repositoryId = repositoryId;
        }

        if (type === "coinmarketcap") {
          if (currency) cleanedService.widget.currency = currency;
          if (symbols) cleanedService.widget.symbols = symbols;
          if (slugs) cleanedService.widget.slugs = slugs;
          if (defaultinterval) cleanedService.widget.defaultinterval = defaultinterval;
        }

        if (type === "docker") {
          if (server) cleanedService.widget.server = server;
          if (container) cleanedService.widget.container = container;
        }
        if (type === "unifi") {
          if (site) cleanedService.widget.site = site;
        }
        if (type === "proxmox") {
          if (node) cleanedService.widget.node = node;
        }
        if (type === "kubernetes") {
          if (namespace) cleanedService.widget.namespace = namespace;
          if (app) cleanedService.widget.app = app;
          if (podSelector) cleanedService.widget.podSelector = podSelector;
        }
        if (["opnsense", "pfsense"].includes(type)) {
          if (wan) cleanedService.widget.wan = wan;
        }
        if (["emby", "jellyfin"].includes(type)) {
          if (enableBlocks !== undefined) cleanedService.widget.enableBlocks = JSON.parse(enableBlocks);
          if (enableNowPlaying !== undefined) cleanedService.widget.enableNowPlaying = JSON.parse(enableNowPlaying);
        }
        if (["sonarr", "radarr"].includes(type)) {
          if (enableQueue !== undefined) cleanedService.widget.enableQueue = JSON.parse(enableQueue);
        }
        if (["diskstation", "qnap"].includes(type)) {
          if (volume) cleanedService.widget.volume = volume;
        }
        if (type === "kopia") {
          if (snapshotHost) cleanedService.widget.snapshotHost = snapshotHost;
          if (snapshotPath) cleanedService.widget.snapshotPath = snapshotPath;
        }
        if (type === "glances") {
          if (metric) cleanedService.widget.metric = metric;
        }
        if (type === "mjpeg") {
          if (stream) cleanedService.widget.stream = stream;
          if (fit) cleanedService.widget.fit = fit;
        }
      }

      return cleanedService;
    }),
  }));
}

export async function getServiceItem(group, service) {
  const configuredServices = await servicesFromConfig();

  const serviceGroup = configuredServices.find((g) => g.name === group);
  if (serviceGroup) {
    const serviceEntry = serviceGroup.services.find((s) => s.name === service);
    if (serviceEntry) return serviceEntry;
  }

  const discoveredServices = await servicesFromDocker();

  const dockerServiceGroup = discoveredServices.find((g) => g.name === group);
  if (dockerServiceGroup) {
    const dockerServiceEntry = dockerServiceGroup.services.find((s) => s.name === service);
    if (dockerServiceEntry) return dockerServiceEntry;
  }

  const kubernetesServices = await servicesFromKubernetes();
  const kubernetesServiceGroup = kubernetesServices.find((g) => g.name === group);
  if (kubernetesServiceGroup) {
    const kubernetesServiceEntry = kubernetesServiceGroup.services.find((s) => s.name === service);
    if (kubernetesServiceEntry) return kubernetesServiceEntry;
  }

  return false;
}

export default async function getServiceWidget(group, service) {
  const serviceItem = await getServiceItem(group, service);
  if (serviceItem) {
    const { widget } = serviceItem;
    return widget;
  }

  return false;
}
