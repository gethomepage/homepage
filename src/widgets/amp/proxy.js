import cache from "memory-cache";

import getServiceWidget from "utils/config/service-helpers";
import createLogger from "utils/logger";
import { formatApiCall } from "utils/proxy/api-helpers";
import { httpProxy } from "utils/proxy/http";
import widgets from "widgets/widgets";

const proxyName = "ampProxyHandler";
const sessionTokenCacheKey = `${proxyName}__sessionToken`;
const logger = createLogger(proxyName);
const appState = {
  "-1": "Undefined",
  0: "Stopped",
  5: "PreStart",
  7: "Configuring",
  10: "Starting",
  20: "Ready",
  30: "Restarting",
  40: "Stopping",
  45: "PreparingForSleep",
  50: "Sleeping",
  60: "Waiting",
  70: "Installing",
  75: "Updating",
  80: "AwaitingUserInput",
  100: "Failed",
  200: "Suspended",
  250: "Maintenance",
  999: "Indeterminate",
};

async function login(widget, service) {
  const endpoint = widgets?.[widget.type]?.mappings.login.endpoint;
  const api = widgets?.[widget.type]?.api;
  const loginUrl = new URL(formatApiCall(api, { endpoint, ...widget }));
  const loginBody = {
    username: widget.username,
    password: widget.password,
    token: "",
    rememberMe: false,
  };
  const headers = { "Content-Type": "application/json", accept: "application/json" };

  const [, , response] = await httpProxy(loginUrl, {
    method: "POST",
    body: JSON.stringify(loginBody),
    headers,
  });

  try {
    const data = JSON.parse(response.toString());
    if (!data.success) {
      logger.error("Unable to login to AMP API");
      return false;
    }

    return cache.put(`${sessionTokenCacheKey}.${service}`, data.sessionID);
  } catch (e) {
    logger.error("Unable to login to AMP API: %s", e);
  }

  return false;
}

async function getInstance(token, widget) {
  const endpoint = widgets?.[widget.type]?.mappings.getInstance.endpoint;
  const api = widgets?.[widget.type]?.api;
  const url = new URL(formatApiCall(api, { endpoint, ...widget }));

  let params = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ instanceId: widget.instanceId }),
  };

  let [, , data] = await httpProxy(url, params);

  if (!data) {
    logger.error("Error getting data from AMP: %s status %d. Data: %s", url, status, data);
    return false;
  }

  return JSON.parse(data.toString());
}

function mapInstanceInfo(instanceInfo) {
  let info = {
    state: appState[instanceInfo.AppState],
    cpu: instanceInfo.Metrics["CPU Usage"].RawValue,
    memoryUsed: instanceInfo.Metrics["Memory Usage"].RawValue,
    memoryUsedPercent: instanceInfo.Metrics["Memory Usage"].Percent,
    users: `${instanceInfo.Metrics["Active Users"].RawValue} / ${instanceInfo.Metrics["Active Users"].MaxValue}`,
  };

  return info;
}

export default async function ampProxyHandler(req, res) {
  const { group, service, index } = req.query;

  if (!group || !service) {
    logger.debug("Invalid or missing service '%s' or group '%s'", service, group);
    return res.status(400).json({ error: "Invalid proxy service type" });
  }

  const widget = await getServiceWidget(group, service, index);
  if (!widget) {
    logger.debug("Invalid or missing widget for service '%s' in group '%s'", service, group);
    return res.status(400).json({ error: "Invalid proxy service type" });
  }

  let token = cache.get(`${sessionTokenCacheKey}.${service}`);
  if (!token) {
    token = await login(widget, service);
  }

  const data = await getInstance(token, widget, service);
  return res.status(200).send(mapInstanceInfo(data));
}
