import cache from "memory-cache";

import { httpProxy } from "utils/proxy/http";
import { formatApiCall } from "utils/proxy/api-helpers";
import getServiceWidget from "utils/config/service-helpers";
import createLogger from "utils/logger";
import widgets from "widgets/widgets";

const proxyName = "freshrssProxyHandler";
const sessionTokenCacheKey = `${proxyName}__sessionToken`;
const logger = createLogger(proxyName);

async function login(widget, service) {
  const endpoint = "accounts/ClientLogin";
  const api = widgets?.[widget.type]?.api;
  const loginUrl = new URL(formatApiCall(api, { endpoint, ...widget }));
  const headers = { "Content-Type": "application/x-www-form-urlencoded" };

  const [, , data] = await httpProxy(loginUrl, {
    method: "POST",
    body: new URLSearchParams({
      Email: widget.username,
      Passwd: widget.password,
    }).toString(),
    headers,
  });

  try {
    const [, token] = data
      .toString()
      .split("\n")
      .find((line) => line.startsWith("Auth="))
      .split("=");
    cache.put(`${sessionTokenCacheKey}.${service}`, token);
    return { token };
  } catch (e) {
    logger.error("Unable to login to FreshRSS API: %s", e);
  }

  return { token: false };
}

async function apiCall(widget, endpoint, service) {
  const key = `${sessionTokenCacheKey}.${service}`;
  const headers = {
    Authorization: `GoogleLogin auth=${cache.get(key)}`,
  };
  const url = new URL(formatApiCall(widgets[widget.type].api, { endpoint, ...widget }));
  const method = "GET";

  let [status, contentType, data, responseHeaders] = await httpProxy(url, {
    method,
    headers,
  });

  if (status === 401) {
    logger.debug("FreshRSS API rejected the request, attempting to obtain new session token");
    const { token } = await login(widget, service);
    headers.Authorization = `GoogleLogin auth=${token}`;

    // retry the request, now with the new session token
    [status, contentType, data, responseHeaders] = await httpProxy(url, {
      method,
      headers,
    });
  }

  if (status !== 200) {
    logger.error("Error getting data from FreshRSS: %s status %d. Data: %s", url, status, data);
    return { status, contentType, data: null, responseHeaders };
  }

  return { status, contentType, data: JSON.parse(data.toString()), responseHeaders };
}

export default async function freshrssProxyHandler(req, res) {
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

  const { data: subscriptionData } = await apiCall(widget, "reader/api/0/subscription/list", service);
  const { data: unreadCountData } = await apiCall(widget, "reader/api/0/unread-count", service);

  return res.status(200).send({
    subscriptions: subscriptionData?.subscriptions.length,
    unread: unreadCountData?.max,
  });
}
