import cache from "memory-cache";

import { httpProxy } from "utils/proxy/http";
import { formatApiCall } from "utils/proxy/api-helpers";
import getServiceWidget from "utils/config/service-helpers";
import createLogger from "utils/logger";
import widgets from "widgets/widgets";

const proxyName = "kavitaProxyHandler";
const sessionTokenCacheKey = `${proxyName}__sessionToken`;
const logger = createLogger(proxyName);

async function login(widget, service) {
  const endpoint = "Account/login";
  const api = widgets?.[widget.type]?.api;
  const loginUrl = new URL(formatApiCall(api, { endpoint, ...widget }));
  const loginBody = { username: widget.username, password: widget.password };
  const headers = { "Content-Type": "application/json", accept: "text/plain" };

  const [, , data] = await httpProxy(loginUrl, {
    method: "POST",
    body: JSON.stringify(loginBody),
    headers,
  });

  try {
    const { token: accessToken } = JSON.parse(data.toString());
    cache.put(`${sessionTokenCacheKey}.${service}`, accessToken);
    return { accessToken };
  } catch (e) {
    logger.error("Unable to login to Kavita API: %s", e);
  }

  return { token: false };
}

async function apiCall(widget, endpoint, service) {
  const key = `${sessionTokenCacheKey}.${service}`;
  const headers = {
    "content-type": "application/json",
    Authorization: `Bearer ${cache.get(key)}`,
  };

  const url = new URL(formatApiCall(widgets[widget.type].api, { endpoint, ...widget }));
  const method = "GET";

  let [status, contentType, data, responseHeaders] = await httpProxy(url, {
    method,
    headers,
  });

  if (status === 401 || status === 403) {
    logger.debug("Kavita API rejected the request, attempting to obtain new session token");
    const { accessToken } = await login(widget, service);
    headers.Authorization = `Bearer ${accessToken}`;

    // retry the request, now with the new session token
    [status, contentType, data, responseHeaders] = await httpProxy(url, {
      method,
      headers,
    });
  }

  if (status !== 200) {
    logger.error("Error getting data from Kavita: %s status %d. Data: %s", url, status, data);
    return { status, contentType, data: null, responseHeaders };
  }

  return { status, contentType, data: JSON.parse(data.toString()), responseHeaders };
}

export default async function KavitaProxyHandler(req, res) {
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

  if (!cache.get(`${sessionTokenCacheKey}.${service}`)) {
    await login(widget, service);
  }

  const { data: statsData } = await apiCall(widget, "Stats/server/stats", service);

  return res.status(200).send({
    seriesCount: statsData?.seriesCount,
    totalFiles: statsData?.totalFiles,
  });
}
