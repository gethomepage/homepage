import { formatApiCall } from "utils/proxy/api-helpers";
import { httpProxy } from "utils/proxy/http";
import { addCookieToJar, setCookieHeader } from "utils/proxy/cookie-jar";
import { getSettings } from "utils/config/config";
import getServiceWidget from "utils/config/service-helpers";
import createLogger from "utils/logger";
import widgets from "widgets/widgets";

const logger = createLogger("unifiProxyHandler");

async function getWidget(req) {
  const { group, service, type } = req.query;

  let widget = null;
  if (type === 'unifi_console') {
    const settings = getSettings();
    widget = settings.unifi_console;
    if (!widget) {
      logger.debug("There is no unifi_console section in settings.yaml");
      return null;
    }
    widget.type = "unifi";
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
  logger.debug("Unifi isn't logged in or is rejecting the reqeust, logging in.");

  const loginBody = { username: widget.username, password: widget.password, remember: true };
  let loginUrl = `${widget.url}/api`;
  if (widget.version === "udm-pro") {
    loginUrl += "/auth"
  }
  loginUrl += "/login";

  const loginParams = { method: "POST", body: JSON.stringify(loginBody) };
  const [status, contentType, data, responseHeaders] = await httpProxy(loginUrl, loginParams);
  return [status, contentType, data, responseHeaders];
}

export default async function unifiProxyHandler(req, res) {
  const widget = await getWidget(req);
  if (!widget) {
    return res.status(400).json({ error: "Invalid proxy service type" });
  }

  const api = widgets?.[widget.type]?.api;
  if (!api) {
    return res.status(403).json({ error: "Service does not support API calls" });
  }

  widget.prefx = "";
  if (widget.version === "udm-pro") {
    widget.prefix = "/proxy/network"
  }

  const { endpoint } = req.query;
  const url = new URL(formatApiCall(api, { endpoint, ...widget }));
  const params = { method: "GET", headers: {} };
  setCookieHeader(url, params);

  let [status, contentType, data, responseHeaders] = await httpProxy(url, params);
  if (status === 401) {
    [status, contentType, data, responseHeaders] = await login(widget);

    if (status !== 200) {
      logger.error("HTTP %d logging in to Unifi.  Data: %s", status, data);
      return res.status(status).end(data);
    }

    const json = JSON.parse(data.toString());
    if (json?.meta?.rc !== "ok") {
      logger.error("Error logging in to Unifi: Data: %s", data);
      return res.status(401).end(data);
    }

    addCookieToJar(url, responseHeaders);
    setCookieHeader(url, params);
  }

  [status, contentType, data] = await httpProxy(url, params);

  if (status !== 200) {
    logger.error("HTTP %d getting data from Unifi.  Data: %s", status, data);
  }

  if (contentType) res.setHeader("Content-Type", contentType);
  return res.status(status).send(data);
}
