import cache from "memory-cache";

import { formatApiCall } from "utils/proxy/api-helpers";
import { httpProxy } from "utils/proxy/http";
import { addCookieToJar, setCookieHeader } from "utils/proxy/cookie-jar";
import getServiceWidget from "utils/config/service-helpers";
import { getPrivateWidgetOptions } from "utils/config/widget-helpers";
import createLogger from "utils/logger";
import widgets from "widgets/widgets";

const udmpPrefix = "/proxy/network";
const proxyName = "omadaProxyHandler";
const prefixCacheKey = `${proxyName}__prefix`;
const logger = createLogger(proxyName);

async function getWidget(req) {
  const { group, service, type } = req.query;

  let widget = null;
  if (type === "omada_console") { // info widget
    const index = req.query?.query ? JSON.parse(req.query.query).index : undefined;
    widget = await getPrivateWidgetOptions(type, index);
    if (!widget) {
      logger.debug("Error retrieving settings for this Omada widget");
      return null;
    }
    widget.type = "omada";
  } else {
    if (!group || !service) {
      logger.debug("Invalid or missing service '%s' or group '%s'", service, group);
      return null;
    }

    widget = await getServiceWidget(group, service);

    if (!widget) {
      logger.debug("Invalid or missing widget for service '%s' in group '%s'", service, group);
      return null;
    }
  }

  return widget;
}

async function login(widget) {
  const endpoint = (widget.prefix === udmpPrefix) ? "auth/login" : "login";
  const api = widgets?.[widget.type]?.api?.replace("{prefix}", ""); // no prefix for login url
  const loginUrl = new URL(formatApiCall(api, { endpoint, ...widget }));
  const loginBody = { username: widget.username, password: widget.password, remember: true };
  const headers = { "Content-Type": "application/json" };
  const [status, contentType, data, responseHeaders] = await httpProxy(loginUrl, {
    method: "POST",
    body: JSON.stringify(loginBody),
    headers,
  });
  return [status, contentType, data, responseHeaders];
}

export default async function omadaProxyHandler(req, res) {
  const widget = await getWidget(req);
  if (!widget) {
    return res.status(400).json({ error: "Invalid proxy service type" });
  }

  const api = widgets?.[widget.type]?.api;
  if (!api) {
    return res.status(403).json({ error: "Service does not support API calls" });
  }

  let [status, contentType, data, responseHeaders] = [];
  let prefix = cache.get(prefixCacheKey);
  if (prefix === null) {
    // auto detect if we're talking to a UDM Pro, and cache the result so that we
    // don't make two requests each time data from Omada is required
    [status, contentType, data, responseHeaders] = await httpProxy(widget.url);
    prefix = "";
    if (responseHeaders?.["x-csrf-token"]) {
      prefix = udmpPrefix;
    }
    cache.put(prefixCacheKey, prefix);
  }

  widget.prefix = prefix;

  const { endpoint } = req.query;
  const url = new URL(formatApiCall(api, { endpoint, ...widget }));
  const params = { method: "GET", headers: {} };
  setCookieHeader(url, params);

  [status, contentType, data, responseHeaders] = await httpProxy(url, params);

  if (status === 401) {
    logger.debug("Omada isn't logged in or rejected the reqeust, attempting login.");
    [status, contentType, data, responseHeaders] = await login(widget);

    if (status !== 200) {
      logger.error("HTTP %d logging in to Omada. Data: %s", status, data);
      return res.status(status).json({error: {message: `HTTP Error ${status}`, url, data}});
    }

    const json = JSON.parse(data.toString());
    if (!(json?.meta?.rc === "ok" || json?.login_time || json?.update_time)) {
      logger.error("Error logging in to Omada: Data: %s", data);
      return res.status(401).end(data);
    }

    addCookieToJar(url, responseHeaders);
    setCookieHeader(url, params);

    logger.debug("Retrying Omada request after login.");
    [status, contentType, data, responseHeaders] = await httpProxy(url, params);
  }

  if (status !== 200) {
    logger.error("HTTP %d getting data from Omada endpoint %s. Data: %s", status, url.href, data);
    return res.status(status).json({error: {message: `HTTP Error ${status}`, url, data}});
  }

  if (contentType) res.setHeader("Content-Type", contentType);
  return res.status(status).send(data);
}
