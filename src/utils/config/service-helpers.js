import { promises as fs } from "fs";
import path from "path";

import yaml from "js-yaml";
import Docker from "dockerode";

import createLogger from "utils/logger";
import checkAndCopyConfig, { CONF_DIR, getSettings, substituteEnvironmentVars } from "utils/config/config";
import getDockerArguments from "utils/config/docker";
import kubernetes from "utils/kubernetes/export";
import { getKubeConfig } from "utils/config/kubernetes";
import * as shvl from "utils/config/shvl";

const logger = createLogger("service-helpers");

function parseServicesToGroups(services) {
  if (!services) {
    return [];
  }

  // map easy to write YAML objects into easy to consume JS arrays
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

export async function servicesFromDocker() {
  checkAndCopyConfig("docker.yaml");

  const dockerYaml = path.join(CONF_DIR, "docker.yaml");
  const rawDockerFileContents = await fs.readFile(dockerYaml, "utf8");
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

        const discovered = containers.map((container) => {
          let constructedService = null;
          const containerLabels = isSwarm ? shvl.get(container, "Spec.Labels") : container.Labels;
          const containerName = isSwarm ? shvl.get(container, "Spec.Name") : container.Names[0];

          Object.keys(containerLabels).forEach((label) => {
            if (label.startsWith("homepage.")) {
              let value = label.replace("homepage.", "");
              if (instanceName && value.startsWith(`instance.${instanceName}.`)) {
                value = value.replace(`instance.${instanceName}.`, "");
              } else if (value.startsWith("instance.")) {
                return;
              }

              if (!constructedService) {
                constructedService = {
                  container: containerName.replace(/^\//, ""),
                  server: serverName,
                  type: "service",
                };
              }
              let substitutedVal = substituteEnvironmentVars(containerLabels[label]);
              if (value === "widget.version") {
                substitutedVal = parseInt(substitutedVal, 10);
              }
              shvl.set(constructedService, value, substitutedVal);
            }
          });

          if (constructedService && (!constructedService.name || !constructedService.group)) {
            logger.error(
              `Error constructing service using homepage labels for container '${containerName.replace(
                /^\//,
                "",
              )}'. Ensure required labels are present.`,
            );
            return null;
          }

          return constructedService;
        });

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

export async function servicesFromKubernetes() {
  const { instanceName } = getSettings();

  checkAndCopyConfig("kubernetes.yaml");

  try {
    const kc = getKubeConfig();
    if (!kc) {
      return [];
    }

    // resource lists
    const [ingressList, traefikIngressList, httpRouteList] = await Promise.all([
      kubernetes.listIngress(),
      kubernetes.listTraefikIngress(),
      kubernetes.listHttpRoute(),
    ]);

    const resources = [...ingressList, ...traefikIngressList, ...httpRouteList];

    if (!resources) {
      return [];
    }
    const services = await Promise.all(
      resources
        .filter((resource) => kubernetes.isDiscoverable(resource, instanceName))
        .map(async (resource) => kubernetes.constructedServiceFromResource(resource)),
    );

    // map service groups
    const mappedServiceGroups = services.reduce((groups, serverService) => {
      let serverGroup = groups.find((group) => group.name === serverService.group);

      if (!serverGroup) {
        serverGroup = {
          name: serverService.group,
          services: [],
        };
        groups.push(serverGroup);
      }

      const { name: serviceName, group: _, ...pushedService } = serverService;

      serverGroup.services.push({
        name: serviceName,
        ...pushedService,
      });

      return groups;
    }, []);

    return mappedServiceGroups;
  } catch (e) {
    if (e) logger.error(e);
    throw e;
  }
}

export function cleanServiceGroups(groups) {
  return groups.map((serviceGroup) => ({
    name: serviceGroup.name,
    services: serviceGroup.services.map((service) => {
      const cleanedService = { ...service };
      if (cleanedService.showStats !== undefined) cleanedService.showStats = JSON.parse(cleanedService.showStats);
      if (typeof service.weight === "string") {
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
      if (!cleanedService.widgets) cleanedService.widgets = [];
      if (cleanedService.widget) {
        cleanedService.widgets.push(cleanedService.widget);
        delete cleanedService.widget;
      }
      cleanedService.widgets = cleanedService.widgets.map((widgetData, index) => {
        // whitelisted set of keys to pass to the frontend
        // alphabetical, grouped by widget(s)
        const {
          // all widgets
          fields,
          hideErrors,
          type,

          // azuredevops
          repositoryId,
          userEmail,

          // beszel
          systemId,

          // calendar
          firstDayInWeek,
          integrations,
          maxEvents,
          showTime,
          previousDays,
          view,
          timezone,

          // coinmarketcap
          currency,
          defaultinterval,
          slugs,
          symbols,

          // customapi
          mappings,
          display,

          // deluge, qbittorrent
          enableLeechProgress,

          // diskstation
          volume,

          // docker
          container,
          server,

          // emby, jellyfin
          enableBlocks,
          enableNowPlaying,

          // emby, jellyfin, tautulli
          enableUser,
          expandOneStreamToTwoRows,
          showEpisodeNumber,

          // frigate
          enableRecentEvents,

          // beszel, glances, immich, komga, mealie, pihole, pfsense, speedtest
          version,

          // glances
          chart,
          metric,
          pointsLimit,
          diskUnits,

          // glances, customapi, iframe, prometheusmetric
          refreshInterval,

          // hdhomerun
          tuner,

          // healthchecks
          uuid,

          // iframe
          allowFullscreen,
          allowPolicy,
          allowScrolling,
          classes,
          loadingStrategy,
          referrerPolicy,
          src,

          // kopia
          snapshotHost,
          snapshotPath,

          // kubernetes
          app,
          namespace,
          podSelector,

          // lubelogger
          vehicleID,

          // mjpeg
          fit,
          stream,

          // openmediavault
          method,

          // openwrt
          interfaceName,

          // opnsense, pfsense
          wan,

          // prometheusmetric
          metrics,

          // proxmox
          node,

          // speedtest
          bitratePrecision,

          // sonarr, radarr
          enableQueue,

          // stocks
          watchlist,
          showUSMarketStatus,

          // truenas
          enablePools,
          nasType,

          // unifi
          site,

          // vikunja
          enableTaskList,

          // wgeasy
          threshold,

          // technitium
          range,

          // spoolman
          spoolIds,
        } = widgetData;

        let fieldsList = fields;
        if (typeof fields === "string") {
          try {
            fieldsList = JSON.parse(fields);
          } catch (e) {
            logger.error("Invalid fields list detected in config for service '%s'", service.name);
            fieldsList = null;
          }
        }

        const widget = {
          type,
          fields: fieldsList || null,
          hide_errors: hideErrors || false,
          service_name: service.name,
          service_group: serviceGroup.name,
          index,
        };

        if (type === "azuredevops") {
          if (userEmail) widget.userEmail = userEmail;
          if (repositoryId) widget.repositoryId = repositoryId;
        }

        if (type === "beszel") {
          if (systemId) widget.systemId = systemId;
        }

        if (type === "coinmarketcap") {
          if (currency) widget.currency = currency;
          if (symbols) widget.symbols = symbols;
          if (slugs) widget.slugs = slugs;
          if (defaultinterval) widget.defaultinterval = defaultinterval;
        }

        if (type === "docker") {
          if (server) widget.server = server;
          if (container) widget.container = container;
        }
        if (type === "unifi") {
          if (site) widget.site = site;
        }
        if (type === "proxmox") {
          if (node) widget.node = node;
        }
        if (type === "kubernetes") {
          if (namespace) widget.namespace = namespace;
          if (app) widget.app = app;
          if (podSelector) widget.podSelector = podSelector;
        }
        if (type === "iframe") {
          if (src) widget.src = src;
          if (classes) widget.classes = classes;
          if (referrerPolicy) widget.referrerPolicy = referrerPolicy;
          if (allowPolicy) widget.allowPolicy = allowPolicy;
          if (allowFullscreen) widget.allowFullscreen = allowFullscreen;
          if (loadingStrategy) widget.loadingStrategy = loadingStrategy;
          if (allowScrolling) widget.allowScrolling = allowScrolling;
          if (refreshInterval) widget.refreshInterval = refreshInterval;
        }
        if (["deluge", "qbittorrent"].includes(type)) {
          if (enableLeechProgress !== undefined) widget.enableLeechProgress = JSON.parse(enableLeechProgress);
        }
        if (["opnsense", "pfsense"].includes(type)) {
          if (wan) widget.wan = wan;
        }
        if (["emby", "jellyfin"].includes(type)) {
          if (enableBlocks !== undefined) widget.enableBlocks = JSON.parse(enableBlocks);
          if (enableNowPlaying !== undefined) widget.enableNowPlaying = JSON.parse(enableNowPlaying);
        }
        if (["emby", "jellyfin", "tautulli"].includes(type)) {
          if (expandOneStreamToTwoRows !== undefined)
            widget.expandOneStreamToTwoRows = !!JSON.parse(expandOneStreamToTwoRows);
          if (showEpisodeNumber !== undefined) widget.showEpisodeNumber = !!JSON.parse(showEpisodeNumber);
          if (enableUser !== undefined) widget.enableUser = !!JSON.parse(enableUser);
        }
        if (["sonarr", "radarr"].includes(type)) {
          if (enableQueue !== undefined) widget.enableQueue = JSON.parse(enableQueue);
        }
        if (type === "truenas") {
          if (enablePools !== undefined) widget.enablePools = JSON.parse(enablePools);
          if (nasType !== undefined) widget.nasType = nasType;
        }
        if (["diskstation", "qnap"].includes(type)) {
          if (volume) widget.volume = volume;
        }
        if (type === "kopia") {
          if (snapshotHost) widget.snapshotHost = snapshotHost;
          if (snapshotPath) widget.snapshotPath = snapshotPath;
        }
        if (["beszel", "glances", "immich", "komga", "mealie", "pfsense", "pihole", "speedtest"].includes(type)) {
          if (version) widget.version = parseInt(version, 10);
        }
        if (type === "glances") {
          if (metric) widget.metric = metric;
          if (chart !== undefined) {
            widget.chart = chart;
          } else {
            widget.chart = true;
          }
          if (refreshInterval) widget.refreshInterval = refreshInterval;
          if (pointsLimit) widget.pointsLimit = pointsLimit;
          if (diskUnits) widget.diskUnits = diskUnits;
        }
        if (type === "mjpeg") {
          if (stream) widget.stream = stream;
          if (fit) widget.fit = fit;
        }
        if (type === "openmediavault") {
          if (method) widget.method = method;
        }
        if (type === "openwrt") {
          if (interfaceName) widget.interfaceName = interfaceName;
        }
        if (type === "customapi") {
          if (mappings) widget.mappings = mappings;
          if (display) widget.display = display;
          if (refreshInterval) widget.refreshInterval = refreshInterval;
        }
        if (type === "calendar") {
          if (integrations) widget.integrations = integrations;
          if (firstDayInWeek) widget.firstDayInWeek = firstDayInWeek;
          if (view) widget.view = view;
          if (maxEvents) widget.maxEvents = maxEvents;
          if (previousDays) widget.previousDays = previousDays;
          if (showTime) widget.showTime = showTime;
          if (timezone) widget.timezone = timezone;
        }
        if (type === "hdhomerun") {
          if (tuner !== undefined) widget.tuner = tuner;
        }
        if (type === "healthchecks") {
          if (uuid !== undefined) widget.uuid = uuid;
        }
        if (type === "speedtest") {
          if (bitratePrecision !== undefined) {
            widget.bitratePrecision = parseInt(bitratePrecision, 10);
          }
        }
        if (type === "stocks") {
          if (watchlist) widget.watchlist = watchlist;
          if (showUSMarketStatus) widget.showUSMarketStatus = showUSMarketStatus;
        }
        if (type === "wgeasy") {
          if (threshold !== undefined) widget.threshold = parseInt(threshold, 10);
        }
        if (type === "frigate") {
          if (enableRecentEvents !== undefined) widget.enableRecentEvents = enableRecentEvents;
        }
        if (type === "technitium") {
          if (range !== undefined) widget.range = range;
        }
        if (type === "lubelogger") {
          if (vehicleID !== undefined) widget.vehicleID = parseInt(vehicleID, 10);
        }
        if (type === "vikunja") {
          if (enableTaskList !== undefined) widget.enableTaskList = !!enableTaskList;
        }
        if (type === "prometheusmetric") {
          if (metrics) widget.metrics = metrics;
          if (refreshInterval) widget.refreshInterval = refreshInterval;
        }
        if (type === "spoolman") {
          if (spoolIds !== undefined) widget.spoolIds = spoolIds;
        }
        return widget;
      });
      return cleanedService;
    }),
    type: serviceGroup.type || "group",
    groups: serviceGroup.groups ? cleanServiceGroups(serviceGroup.groups) : [],
  }));
}

export function findGroupByName(groups, name) {
  // Deep search for a group by name. Using for loop allows for early return
  for (let i = 0; i < groups.length; i += 1) {
    const group = groups[i];
    if (group.name === name) {
      return group;
    } else if (group.groups) {
      const foundGroup = findGroupByName(group.groups, name);
      if (foundGroup) {
        foundGroup.parent = group.name;
        return foundGroup;
      }
    }
  }
  return null;
}

export async function getServiceItem(group, service) {
  const configuredServices = await servicesFromConfig();

  const serviceGroup = findGroupByName(configuredServices, group);
  if (serviceGroup) {
    const serviceEntry = serviceGroup.services.find((s) => s.name === service);
    if (serviceEntry) return serviceEntry;
  }

  const discoveredServices = await servicesFromDocker();

  const dockerServiceGroup = findGroupByName(discoveredServices, group);
  if (dockerServiceGroup) {
    const dockerServiceEntry = dockerServiceGroup.services.find((s) => s.name === service);
    if (dockerServiceEntry) return dockerServiceEntry;
  }

  const kubernetesServices = await servicesFromKubernetes();
  const kubernetesServiceGroup = findGroupByName(kubernetesServices, group);
  if (kubernetesServiceGroup) {
    const kubernetesServiceEntry = kubernetesServiceGroup.services.find((s) => s.name === service);
    if (kubernetesServiceEntry) return kubernetesServiceEntry;
  }

  return false;
}

export default async function getServiceWidget(group, service, index) {
  const serviceItem = await getServiceItem(group, service);
  if (serviceItem) {
    const { widget, widgets } = serviceItem;
    return index > -1 && widgets ? widgets[index] : widget;
  }
  return false;
}
