import cache from "memory-cache";

import getServiceWidget from "utils/config/service-helpers";
import createLogger from "utils/logger";
import { formatApiCall } from "utils/proxy/api-helpers";
import { httpProxy } from "utils/proxy/http";
import widgets from "widgets/widgets";

const proxyName = "bookorbitProxyHandler";
const accessTokenCacheKey = `${proxyName}__accessToken`;
const refreshTokenCacheKey = `${proxyName}__refreshToken`;
const logger = createLogger(proxyName);

async function requestTokens(widget, service, endpoint, body) {
  const url = new URL(formatApiCall(widgets[widget.type].api, { ...widget, endpoint }));
  const [status, , data] = await httpProxy(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", accept: "application/json" },
    body: JSON.stringify(body),
  });

  if (status !== 200) {
    logger.debug("BookOrbit %s failed for service '%s' with status %d", endpoint, service, status);
    return null;
  }

  try {
    const { accessToken, refreshToken } = JSON.parse(data.toString());
    if (!accessToken) return null;

    // expired tokens are replaced when a request gets a 401
    cache.put(`${accessTokenCacheKey}.${service}`, accessToken);
    if (refreshToken) cache.put(`${refreshTokenCacheKey}.${service}`, refreshToken);
    return accessToken;
  } catch (e) {
    logger.error("Unable to parse BookOrbit %s response: %s", endpoint, e);
  }

  return null;
}

async function loginOrRefresh(widget, service, forceNew = false) {
  if (!forceNew) {
    const cached = cache.get(`${accessTokenCacheKey}.${service}`);
    if (cached) return cached;
  }

  const refreshToken = cache.get(`${refreshTokenCacheKey}.${service}`);
  if (refreshToken) {
    const accessToken = await requestTokens(widget, service, "auth/refresh", { refreshToken });
    if (accessToken) return accessToken;
    cache.del(`${refreshTokenCacheKey}.${service}`);
  }

  // native clients get the refresh token in the body
  return requestTokens(widget, service, "auth/login", {
    username: widget.username,
    password: widget.password,
    clientKind: "native",
    deviceLabel: "Homepage",
  });
}

async function apiCall(widget, endpoint, service) {
  const url = new URL(formatApiCall(widgets[widget.type].api, { ...widget, endpoint }));
  const request = async (accessToken) =>
    httpProxy(url, {
      method: "GET",
      headers: { accept: "application/json", Authorization: `Bearer ${accessToken}` },
    });

  let accessToken = await loginOrRefresh(widget, service);
  if (!accessToken) return { status: 401, data: null };

  let [status, , data] = await request(accessToken);

  if (status === 401) {
    logger.debug("BookOrbit API rejected the request, attempting to obtain a new access token");
    cache.del(`${accessTokenCacheKey}.${service}`);
    accessToken = await loginOrRefresh(widget, service, true);
    if (!accessToken) return { status, data: null };
    [status, , data] = await request(accessToken);
  }

  if (status !== 200) {
    logger.error("Error getting data from BookOrbit: %s status %d. Data: %s", url, status, data);
    return { status, data: null };
  }

  try {
    return { status, data: JSON.parse(data.toString()) };
  } catch (e) {
    logger.error("Error parsing BookOrbit response: %s", e);
  }

  return { status: 500, data: null };
}

export default async function bookorbitProxyHandler(req, res) {
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

  if (!widget.username || !widget.password) {
    logger.debug("Missing credentials for BookOrbit widget in service '%s'", service);
    return res.status(400).json({ error: "Missing BookOrbit credentials" });
  }

  const library = await apiCall(widget, "statistics/summary", service);
  if (!library.data) {
    return res.status(library.status).json({ error: "Error fetching BookOrbit library statistics" });
  }

  const reading = await apiCall(widget, "user-statistics/summary", service);
  if (!reading.data) {
    return res.status(reading.status).json({ error: "Error fetching BookOrbit reading statistics" });
  }

  return res.status(200).json({
    books: library.data.totalBooks,
    authors: library.data.totalAuthors,
    series: library.data.totalSeries,
    storage: library.data.totalStorageBytes,
    reading: reading.data.inProgressBooks,
    finished: reading.data.completedBooks,
  });
}
