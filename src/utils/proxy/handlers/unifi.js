import cache from "memory-cache";

import createLogger from "utils/logger";
import { formatApiCall } from "utils/proxy/api-helpers";
import { addCookieToJar, setCookieHeader } from "utils/proxy/cookie-jar";
import { httpProxy } from "utils/proxy/http";
import widgets from "widgets/widgets";

function isSuccessfulLoginResponse(data) {
  const json = JSON.parse(data.toString());
  return json?.meta?.rc === "ok" || json?.login_time || json?.update_time;
}

async function login({ widget, api, endpoint, csrfToken }) {
  const loginUrl = new URL(formatApiCall(api.replace("{prefix}", ""), { endpoint, ...widget }));
  const headers = { "Content-Type": "application/json" };

  if (csrfToken) {
    headers["X-CSRF-TOKEN"] = csrfToken;
  }

  return httpProxy(loginUrl, {
    method: "POST",
    body: JSON.stringify({ username: widget.username, password: widget.password, remember: true, rememberMe: true }),
    headers,
  });
}

export default function createUnifiProxyHandler({
  proxyName,
  resolveWidget,
  resolveRequestContext,
  getLoginEndpoint = () => "auth/login",
  shouldAttemptLogin = ({ widget }) => !widget.key,
}) {
  const prefixCacheKey = `${proxyName}__prefix`;
  const logger = createLogger(proxyName);

  return async function unifiProxyHandler(req, res) {
    const widget = await resolveWidget(req, logger);
    const { service, endpoint } = req.query;

    if (!widget) {
      return res.status(400).json({ error: "Invalid proxy service type" });
    }

    const api = widgets?.[widget.type]?.api;
    if (!api) {
      return res.status(403).json({ error: "Service does not support API calls" });
    }

    const cachedPrefix = cache.get(`${prefixCacheKey}.${service}`);
    const {
      prefix,
      headers = {},
      csrfToken: initialCsrfToken,
    } = await resolveRequestContext({
      cachedPrefix,
      logger,
      req,
      service,
      widget,
    });
    let csrfToken = initialCsrfToken;

    cache.put(`${prefixCacheKey}.${service}`, prefix);

    widget.prefix = prefix;
    const url = new URL(formatApiCall(api, { endpoint, ...widget }));
    const params = { method: "GET", headers };
    setCookieHeader(url, params);

    let [status, contentType, data, responseHeaders] = await httpProxy(url, params);

    if (status === 401 && shouldAttemptLogin({ widget, req, responseHeaders })) {
      logger.debug("UniFi request was rejected, attempting login.");

      if (responseHeaders?.["x-csrf-token"]) {
        csrfToken = responseHeaders["x-csrf-token"];
      }

      [status, contentType, data, responseHeaders] = await login({
        api,
        csrfToken,
        endpoint: getLoginEndpoint({ prefix, req, widget }),
        widget,
      });

      if (status !== 200) {
        logger.error("HTTP %d logging in to UniFi. Data: %s", status, data);
        return res.status(status).json({ error: { message: `HTTP Error ${status}`, url, data } });
      }

      if (!isSuccessfulLoginResponse(data)) {
        logger.error("Error logging in to UniFi: Data: %s", data);
        return res.status(401).end(data);
      }

      addCookieToJar(url, responseHeaders);
      setCookieHeader(url, params);

      [status, contentType, data, responseHeaders] = await httpProxy(url, params);
    }

    if (status !== 200) {
      logger.error("HTTP %d getting data from UniFi endpoint %s. Data: %s", status, url.href, data);
      return res.status(status).json({ error: { message: `HTTP Error ${status}`, url, data } });
    }

    if (contentType) {
      res.setHeader("Content-Type", contentType);
    }

    return res.status(status).send(data);
  };
}
