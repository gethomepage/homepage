import cache from "memory-cache";

import { httpProxy } from "utils/proxy/http";
import { formatApiCall } from "utils/proxy/api-helpers";
import getServiceWidget from "utils/config/service-helpers";
import createLogger from "utils/logger";
import widgets from "widgets/widgets";

const proxyName = "transmissionProxyHandler";
const headerCacheKey = `${proxyName}__headers`;
const logger = createLogger(proxyName);

export default async function transmissionProxyHandler(req, res) {
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

  let headers = cache.get(`${headerCacheKey}.${service}`);
  if (!headers) {
    headers = {
      "content-type": "application/json",
    };
    cache.put(`${headerCacheKey}.${service}`, headers);
  }

  const api = `${widget.url}${widget.rpcUrl || widgets[widget.type].rpcUrl}rpc`;

  const url = new URL(formatApiCall(api, { endpoint: undefined, ...widget }));
  const csrfHeaderName = "x-transmission-session-id";

  const method = "POST";
  const auth = `${widget.username}:${widget.password}`;
  const body = JSON.stringify({
    method: "torrent-get",
    arguments: {
      fields: ["percentDone", "status", "rateDownload", "rateUpload"],
    },
  });

  let [status, contentType, data, responseHeaders] = await httpProxy(url, {
    method,
    auth,
    body,
    headers,
  });

  if (status === 409) {
    logger.debug("Transmission is rejecting the request, but returning a CSRF token");
    headers[csrfHeaderName] = responseHeaders[csrfHeaderName];
    cache.put(`${headerCacheKey}.${service}`, headers);

    // retry the request, now with the CSRF token
    [status, contentType, data, responseHeaders] = await httpProxy(url, {
      method,
      auth,
      body,
      headers,
    });
  }

  if (status !== 200) {
    logger.error("Error getting data from Transmission: %d.  Data: %s", status, data);
    return res.status(500).send({ error: { message: "Error getting data from Transmission", url, data } });
  }

  if (contentType) res.setHeader("Content-Type", contentType);
  return res.status(status).send(data);
}
