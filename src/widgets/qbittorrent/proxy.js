import { formatApiCall } from "utils/proxy/api-helpers";
import { httpProxy } from "utils/proxy/http";
import getServiceWidget from "utils/config/service-helpers";
import createLogger from "utils/logger";

const logger = createLogger("qbittorrentProxyHandler");

async function login(widget) {
  logger.debug("qBittorrent is rejecting the request, logging in.");
  const loginUrl = new URL(`${widget.url}/api/v2/auth/login`).toString();
  const loginBody = `username=${encodeURIComponent(widget.username)}&password=${encodeURIComponent(widget.password)}`;
  const loginParams = {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: loginBody,
  };

  // eslint-disable-next-line no-unused-vars
  const [status, contentType, data] = await httpProxy(loginUrl, loginParams);
  return [status, data];
}

export default async function qbittorrentProxyHandler(req, res) {
  const { group, service, endpoint, index } = req.query;

  if (!group || !service) {
    logger.debug("Invalid or missing service '%s' or group '%s'", service, group);
    return res.status(400).json({ error: "Invalid proxy service type" });
  }

  const widget = await getServiceWidget(group, service, index);

  if (!widget) {
    logger.debug("Invalid or missing widget for service '%s' in group '%s'", service, group);
    return res.status(400).json({ error: "Invalid proxy service type" });
  }

  const url = new URL(formatApiCall("{url}/api/v2/{endpoint}", { endpoint, ...widget }));
  const params = { method: "GET", headers: {} };

  let [status, contentType, data] = await httpProxy(url, params);
  if (status === 403) {
    [status, data] = await login(widget);

    if (status !== 200) {
      logger.error("HTTP %d logging in to qBittorrent.  Data: %s", status, data);
      return res.status(status).end(data);
    }

    if (data.toString() !== "Ok.") {
      logger.error("Error logging in to qBittorrent: Data: %s", data);
      return res.status(401).end(data);
    }

    [status, contentType, data] = await httpProxy(url, params);
  }

  if (status !== 200) {
    logger.error("HTTP %d getting data from qBittorrent.  Data: %s", status, data);
  }

  if (contentType) res.setHeader("Content-Type", contentType);
  return res.status(status).send(data);
}
