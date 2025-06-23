import { servicesFromDocker } from "./service-helpers/docker";
import { servicesFromConfig } from "./service-helpers/config";
import { servicesFromKubernetes } from "./service-helpers/kubernetes";

import createLogger from "utils/logger";
const logger = createLogger("service-helpers");

export {servicesFromDocker, servicesFromConfig, servicesFromKubernetes};

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
          enableMediaControl,

          // emby, jellyfin, tautulli
          enableUser,
          expandOneStreamToTwoRows,
          showEpisodeNumber,

          // frigate
          enableRecentEvents,

          // gamedig
          gameToken,

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

          // jellystat
          days,

          // komodo
          showSummary,
          showStacks,

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

          // portainer
          kubernetes,

          // prometheusmetric
          metrics,

          // proxmox
          node,

          // proxmoxbackupserver
          datastore,

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
        if (type === "portainer") {
          if (kubernetes) widget.kubernetes = !!JSON.parse(kubernetes);
        }
        if (type === "proxmox") {
          if (node) widget.node = node;
        }
        if (type === "proxmoxbackupserver") {
          if (datastore) widget.datastore = datastore;
        }
        if (type === "komodo") {
          if (showSummary !== undefined) widget.showSummary = !!JSON.parse(showSummary);
          if (showStacks !== undefined) widget.showStacks = !!JSON.parse(showStacks);
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
          if (enableMediaControl !== undefined) widget.enableMediaControl = !!JSON.parse(enableMediaControl);
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
        if (type === "gamedig") {
          if (gameToken) widget.gameToken = gameToken;
        }
        if (type === "kopia") {
          if (snapshotHost) widget.snapshotHost = snapshotHost;
          if (snapshotPath) widget.snapshotPath = snapshotPath;
        }
        if (
          ["beszel", "glances", "immich", "komga", "mealie", "pfsense", "pihole", "speedtest", "wgeasy"].includes(type)
        ) {
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
        if (type === "jellystat") {
          if (days !== undefined) widget.days = parseInt(days, 10);
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
