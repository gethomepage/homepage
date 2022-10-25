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
  // eslint-disable-next-line no-unused-vars
  const [status, contentType, data, responseHeaders] = await httpProxy(loginUrl, {
    method: "POST",
    body: JSON.stringify(loginBody),
    headers,
  });

  try {
    const { access_token: accessToken, expires_in: expiresIn } = JSON.parse(data.toString());
  
    cache.put(sessionTokenCacheKey, accessToken, (expiresIn * 1000) - 5 * 60 * 1000); // expiresIn (s) - 5m
    return { accessToken };
  } catch (e) {
    logger.error("Unable to login to Homebridge API: %s", e);
  }

  return { accessToken: false };
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
    logger.debug("Homebridge API rejected the request, attempting to obtain new session token");
    const { accessToken } = login(widget);
    headers.Authorization = `Bearer ${accessToken}`;

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

  const { data: statusData } = await apiCall(widget, "status/homebridge");
  const { data: versionData } = await apiCall(widget, "status/homebridge-version");
  const { data: childBridgeData } = await apiCall(widget, "status/homebridge/child-bridges");
  const { data: pluginsData } = await apiCall(widget, "plugins");

  return res.status(200).send({
      status: statusData?.status,
      updateAvailable: versionData?.updateAvailable,
      plugins: {
        updatesAvailable: pluginsData?.filter(p => p.updateAvailable).length,
      },
      childBridges: {
        running: childBridgeData?.filter(cb => cb.status === "ok").length,
        total: childBridgeData?.length
      }
  });
}
