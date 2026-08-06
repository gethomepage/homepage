import getServiceWidget from "utils/config/service-helpers";
import { getPrivateWidgetOptions } from "utils/config/widget-helpers";
import createLogger from "utils/logger";
import { asJson, formatApiCall, parseVersionForUrl } from "utils/proxy/api-helpers";
import createUnifiProxyHandler from "utils/proxy/handlers/unifi";
import { httpProxy } from "utils/proxy/http";
import widgets from "widgets/widgets";

const proxyName = "unifiProxyHandler";
const logger = createLogger(proxyName);

const udmpPrefix = "/proxy/network";
const integrationPageLimit = 200;

async function getWidget(req, log) {
  const { group, service, index } = req.query;

  let widget = null;
  if (group === "unifi_console" && service === "unifi_console") {
    // info widget
    const infowidgetIndex = req.query?.query ? JSON.parse(req.query.query).index : undefined;
    widget = await getPrivateWidgetOptions("unifi_console", infowidgetIndex);
    if (!widget) {
      log.debug("Error retrieving settings for this Unifi widget");
      return null;
    }
    widget.type = "unifi";
  } else {
    if (!group || !service) {
      log.debug("Invalid or missing service '%s' or group '%s'", service, group);
      return null;
    }

    widget = await getServiceWidget(group, service, index);

    if (!widget) {
      log.debug("Invalid or missing widget for service '%s' in group '%s'", service, group);
      return null;
    }
  }

  return widget;
}

async function resolveRequestContext({ cachedPrefix, widget }) {
  const headers = {};

  if (widget.key) {
    headers["X-API-KEY"] = widget.key;
    headers.Accept = "application/json";
    return { headers, prefix: udmpPrefix };
  }

  if (cachedPrefix !== null) {
    return { headers, prefix: cachedPrefix };
  }

  const [, , , responseHeaders] = await httpProxy(widget.url);
  let prefix = "";
  let csrfToken;

  if (responseHeaders?.["x-csrf-token"]) {
    prefix = udmpPrefix;
    csrfToken = responseHeaders["x-csrf-token"];
  } else if (responseHeaders?.["access-control-expose-headers"] || responseHeaders?.["Access-Control-Expose-Headers"]) {
    prefix = udmpPrefix;
  }

  return { csrfToken, headers, prefix };
}

// ---------------------------------------------------------------------------
// version 2: UniFi Network Integration API
// ---------------------------------------------------------------------------

function getWidgetVersion(widget) {
  return parseVersionForUrl(widget.version, 1) ?? 1;
}

async function integrationGet(widget, endpoint) {
  const url = formatApiCall(widgets[widget.type].apiv2, { endpoint, ...widget });
  const [status, , data] = await httpProxy(url, {
    method: "GET",
    headers: {
      "X-API-KEY": widget.key,
      Accept: "application/json",
    },
  });

  if (status !== 200) {
    logger.error("HTTP %d getting data from UniFi integration endpoint %s. Data: %s", status, url, data);
    const error = new Error(`HTTP Error ${status}`);
    error.status = status;
    error.url = url;
    error.data = data;
    throw error;
  }

  return asJson(data);
}

// The integration API pages every list endpoint (offset/limit/totalCount).
async function integrationGetAll(widget, endpoint) {
  const items = [];
  let offset = 0;

  for (;;) {
    const separator = endpoint.includes("?") ? "&" : "?";
    // eslint-disable-next-line no-await-in-loop
    const page = await integrationGet(widget, `${endpoint}${separator}offset=${offset}&limit=${integrationPageLimit}`);
    const data = page?.data ?? [];
    items.push(...data);

    offset += integrationPageLimit;
    if (data.length < integrationPageLimit) break;
    if (page?.totalCount !== undefined && offset >= page.totalCount) break;
  }

  return items;
}

// Only the total is needed, so request a single item and read totalCount.
async function integrationCount(widget, endpoint) {
  const page = await integrationGet(widget, endpoint);
  return page?.totalCount ?? page?.count ?? page?.data?.length ?? 0;
}

// The integration API returns features as a string array (e.g. ["accessPoint"]),
// but older/newer builds have used an object map - accept both.
function hasFeature(device, feature) {
  const features = device?.features;
  if (Array.isArray(features)) {
    return features.includes(feature);
  }
  const value = features?.[feature];
  return value !== undefined && value !== null && value !== false;
}

function isAccessPoint(device) {
  return hasFeature(device, "accessPoint") || (device?.interfaces?.radios?.length ?? 0) > 0;
}

function isSwitch(device) {
  return hasFeature(device, "switching");
}

// The integration API has no explicit "this is the gateway" flag, so try a few
// signals in order of reliability. Returns undefined when no gateway is adopted
// (common on UniFi OS Server setups with access points only).
function findGateway(devices) {
  const byFeature = devices.find((device) => hasFeature(device, "gateway") || hasFeature(device, "routing"));
  if (byFeature) return byFeature;

  const byModel = devices.find((device) => /^(UDM|UDR|UDW|UCG|UXG|USG|UX)/i.test(device?.model ?? ""));
  if (byModel) return byModel;

  // Root of the topology - only trustworthy if uplink data is actually present.
  if (devices.some((device) => device?.uplink?.deviceId)) {
    return devices.find((device) => !device?.uplink?.deviceId);
  }

  return undefined;
}

function subsystemStatus(devices, userCount) {
  if (devices.length === 0) {
    return userCount > 0 ? "ok" : "unknown";
  }
  return devices.every((device) => device.state === "ONLINE") ? "ok" : "error";
}

async function handleIntegrationRequest(req, res, widget) {
  if (!widget.key) {
    logger.error("UniFi widget version 2 requires an API key");
    return res.status(400).json({
      error: { message: "UniFi widget version 2 requires an API key. Set 'key' instead of username/password." },
    });
  }

  const sitesPage = await integrationGet(widget, "sites");
  const sites = sitesPage?.data ?? [];
  const site = widget.site ? sites.find((s) => s.name === widget.site) : sites[0];

  if (!site) {
    return res.status(404).json({ error: { message: `Site '${widget.site ?? "default"}' not found` } });
  }

  const wiredFilter = encodeURIComponent("type.eq('WIRED')");
  const wirelessFilter = encodeURIComponent("type.eq('WIRELESS')");

  const [wiredUsers, wirelessUsers, devices] = await Promise.all([
    integrationCount(widget, `sites/${site.id}/clients?limit=1&filter=${wiredFilter}`),
    integrationCount(widget, `sites/${site.id}/clients?limit=1&filter=${wirelessFilter}`),
    integrationGetAll(widget, `sites/${site.id}/devices`),
  ]);

  const accessPoints = devices.filter(isAccessPoint);
  const switches = devices.filter(isSwitch);
  const gateway = findGateway(devices);

  let gatewayStats;
  if (gateway) {
    try {
      gatewayStats = await integrationGet(widget, `sites/${site.id}/devices/${gateway.id}/statistics/latest`);
    } catch {
      logger.debug("Could not read statistics for gateway %s", gateway.id);
    }
  }

  let wanStatus = "unknown";
  if (gateway) {
    wanStatus = gateway.state === "ONLINE" ? "ok" : "error";
  }

  const health = [
    {
      subsystem: "wan",
      status: wanStatus,
      ...(gatewayStats?.uptimeSec ? { "gw_system-stats": { uptime: gatewayStats.uptimeSec } } : {}),
    },
    {
      subsystem: "lan",
      status: subsystemStatus(switches, wiredUsers),
      num_user: wiredUsers,
      num_adopted: switches.length,
    },
    {
      subsystem: "wlan",
      status: subsystemStatus(accessPoints, wirelessUsers),
      num_user: wirelessUsers,
      num_adopted: accessPoints.length,
    },
  ];

  // Shaped like the legacy stat/sites response so component.jsx stays unchanged.
  return res.status(200).json({
    meta: { rc: "ok" },
    data: [
      {
        name: "default",
        desc: site.name,
        health,
      },
    ],
  });
}

// ---------------------------------------------------------------------------

const legacyProxyHandler = createUnifiProxyHandler({
  proxyName,
  resolveWidget: getWidget,
  resolveRequestContext,
  getLoginEndpoint: ({ prefix }) => (prefix === udmpPrefix ? "auth/login" : "login"),
});

export default async function unifiProxyHandler(req, res) {
  const widget = await getWidget(req, logger);

  if (!widget) {
    return res.status(400).json({ error: "Invalid proxy service type" });
  }

  if (getWidgetVersion(widget) < 2) {
    return legacyProxyHandler(req, res);
  }

  try {
    return await handleIntegrationRequest(req, res, widget);
  } catch (error) {
    const status = error.status ?? 500;
    return res.status(status).json({
      error: { message: error.message, url: error.url, data: error.data },
    });
  }
}
