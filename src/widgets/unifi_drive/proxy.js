import cache from "memory-cache";

import getServiceWidget from "utils/config/service-helpers";
import createLogger from "utils/logger";
import { formatApiCall } from "utils/proxy/api-helpers";
import { addCookieToJar, setCookieHeader } from "utils/proxy/cookie-jar";
import { httpProxy } from "utils/proxy/http";
import widgets from "widgets/widgets";

const drivePrefix = "/proxy/drive";
const proxyName = "unifiDriveProxyHandler";
const prefixCacheKey = `${proxyName}__prefix`;
const logger = createLogger(proxyName);

async function getWidget(req) {
  const { group, service, index } = req.query;
  if (!group || !service) return null;

  const widget = await getServiceWidget(group, service, index);
  if (!widget) {
    logger.debug("Invalid or missing widget for service '%s' in group '%s'", service, group);
    return null;
  }
  return widget;
}

async function login(widget, csrfToken) {
  const api = widgets?.[widget.type]?.api?.replace("{prefix}", "");
  const loginUrl = new URL(formatApiCall(api, { endpoint: "auth/login", ...widget }));
  const headers = { "Content-Type": "application/json" };
  if (csrfToken) headers["X-CSRF-TOKEN"] = csrfToken;

  return httpProxy(loginUrl, {
    method: "POST",
    body: JSON.stringify({ username: widget.username, password: widget.password, remember: true, rememberMe: true }),
    headers,
  });
}

export default async function unifiDriveProxyHandler(req, res) {
  const widget = await getWidget(req);
  const { service } = req.query;
  if (!widget) return res.status(400).json({ error: "Invalid proxy service type" });

  const api = widgets?.[widget.type]?.api;
  if (!api) return res.status(403).json({ error: "Service does not support API calls" });

  let [status, contentType, data, responseHeaders] = [];
  let prefix = cache.get(`${prefixCacheKey}.${service}`);
  let csrfToken;

  if (prefix === null) {
    [status, contentType, data, responseHeaders] = await httpProxy(widget.url);
    prefix = drivePrefix;
    if (responseHeaders?.["x-csrf-token"]) csrfToken = responseHeaders["x-csrf-token"];
  }
  cache.put(`${prefixCacheKey}.${service}`, prefix);

  widget.prefix = prefix;
  const url = new URL(formatApiCall(api, { endpoint: req.query.endpoint, ...widget }));
  const params = { method: "GET", headers: {} };
  setCookieHeader(url, params);

  [status, contentType, data, responseHeaders] = await httpProxy(url, params);

  if (status === 401) {
    logger.debug("UniFi Drive not authenticated, attempting login.");
    if (responseHeaders?.["x-csrf-token"]) csrfToken = responseHeaders["x-csrf-token"];
    [status, contentType, data, responseHeaders] = await login(widget, csrfToken);

    if (status !== 200) {
      logger.error("HTTP %d logging in to UniFi Drive. Data: %s", status, data);
      return res.status(status).json({ error: { message: `HTTP Error ${status}`, url, data } });
    }

    const json = JSON.parse(data.toString());
    if (!(json?.meta?.rc === "ok" || json?.login_time || json?.update_time)) {
      logger.error("Error logging in to UniFi Drive: Data: %s", data);
      return res.status(401).end(data);
    }

    addCookieToJar(url, responseHeaders);
    setCookieHeader(url, params);
    [status, contentType, data, responseHeaders] = await httpProxy(url, params);
  }

  if (status !== 200) {
    logger.error("HTTP %d from UniFi Drive endpoint %s. Data: %s", status, url.href, data);
    return res.status(status).json({ error: { message: `HTTP Error ${status}`, url, data } });
  }

  if (contentType) res.setHeader("Content-Type", contentType);
  return res.status(status).send(data);
}
