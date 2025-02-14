import cache from "memory-cache";

import { httpProxy } from "utils/proxy/http";
import { formatApiCall } from "utils/proxy/api-helpers";
import getServiceWidget from "utils/config/service-helpers";
import createLogger from "utils/logger";
import widgets from "widgets/widgets";

const proxyName = "backrestProxyHandler";
const headerCacheKey = `${proxyName}__headers`;
const logger = createLogger(proxyName);

export default async function backrestProxyHandler(req, res) {
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
      "Authorization": `Basic ${Buffer.from(`${widget.username}:${widget.password}`).toString("base64")}`,
    };
    cache.put(`${headerCacheKey}.${service}`, headers);
  }

  const { api } = widgets[widget.type];

  const url = new URL(formatApiCall(api, { endpoint: undefined, ...widget }));
  const method = "POST";
  const body = JSON.stringify({});

  try {
    const [status, contentType, data,] = await httpProxy(url, {
      method,
      body,
      headers,
    });

    if (status !== 200) {
      logger.error("Error getting data from Backrest: %d.  Data: %s", status, data);
      return res.status(500).send({ error: { message: "Error getting data from Backrest", url, data } });
    }

    if (contentType) res.setHeader("Content-Type", contentType);
    return res.status(status).send(data);
  } catch (error) {
    logger.error("Exception calling Backrest API: %s", error.message);
    return res.status(500).json({ error: "Backrest API Error", message: error.message });
  }
}
