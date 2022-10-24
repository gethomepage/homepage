import cache from "memory-cache";

import { httpProxy } from "utils/proxy/http";
import { formatApiCall } from "utils/proxy/api-helpers";
import getServiceWidget from "utils/config/service-helpers";
import createLogger from "utils/logger";
import widgets from "widgets/widgets";

const proxyName = "homebridgeProxyHandler";
const sessionTokenCacheKey = `${proxyName}__sessionToken`;
const logger = createLogger(proxyName);

async function login(widget) {
  const endpoint = "auth/login";
  const api = widgets?.[widget.type]?.api
  const loginUrl = new URL(formatApiCall(api, { endpoint, ...widget }));
  const loginBody = { username: widget.username, password: widget.password };
  const headers = { "Content-Type": "application/json" };
  const [status, contentType, data, responseHeaders] = await httpProxy(loginUrl, {
    method: "POST",
    body: JSON.stringify(loginBody),
    headers,
  });

  const dataParsed = JSON.parse(data.toString())

  cache.put(sessionTokenCacheKey, dataParsed.access_token);

  return { status, contentType, data: dataParsed, responseHeaders };
}

async function apiCall(widget, endpoint) {
  const headers = {
    "content-type": "application/json",
    "Authorization": `Bearer ${cache.get(sessionTokenCacheKey)}`,
  }

  const url = new URL(formatApiCall(widgets[widget.type].api, { endpoint, ...widget }));
  const method = "GET";

  let [status, contentType, data, responseHeaders] = await httpProxy(url, {
    method,
    headers,
  });

  if (status === 401) {
    logger.debug("Homebridge is rejecting the request, but obtaining new session token");
    const { data: loginData } = login(widget);
    headers.Authorization = loginData?.auth_token;

    // retry the request, now with the new session token
    [status, contentType, data, responseHeaders] = await httpProxy(url, {
      method,
      headers,
    });
  }

  if (status !== 200) {
    logger.error("Error getting data from Homebridge: %d.  Data: %s", status, data);
  }

  return { status, contentType, data: JSON.parse(data.toString()), responseHeaders };
}

function formatPluginsResponse(plugins) {
  const quantity = plugins?.data.filter(p => p.updateAvailable).length;
  return {
    updatesAvailable: quantity > 0,
    quantity,
  }
}

function formatChildBridgesResponse(childBridges) {
  const quantity = childBridges?.data?.length
  return {
    quantity,
    quantityWithOkStatus: childBridges?.data?.filter(cb => cb.status === "ok").length,
  }
}

export default async function homebridgeProxyHandler(req, res) {
  const { group, service } = req.query;

  if (!group || !service) {
    logger.debug("Invalid or missing service '%s' or group '%s'", service, group);
    return res.status(400).json({ error: "Invalid proxy service type" });
  }

  const widget = await getServiceWidget(group, service);

  if (!widget) {
    logger.debug("Invalid or missing widget for service '%s' in group '%s'", service, group);
    return res.status(400).json({ error: "Invalid proxy service type" });
  }

  if (!cache.get(sessionTokenCacheKey)) {
    await login(widget);
  }

  const statusRs = await apiCall(widget, "status/homebridge");
  const versionRs = await apiCall(widget, "status/homebridge-version");
  const childBrigdeRs = await apiCall(widget, "status/homebridge/child-bridges");
  const pluginsRs = await apiCall(widget, "plugins");

  return res.status(200).send({
    data: {
      status: statusRs?.data?.status,
      updateAvailable: versionRs?.data?.updateAvailable,
      plugins: formatPluginsResponse(pluginsRs),
      childBridges: formatChildBridgesResponse(childBrigdeRs),
    }
  });
}
