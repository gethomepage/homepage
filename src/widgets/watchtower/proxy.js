import cache from "memory-cache";

import { httpProxy } from "utils/proxy/http";
import { formatApiCall } from "utils/proxy/api-helpers";
import getServiceWidget from "utils/config/service-helpers";
import createLogger from "utils/logger";
import widgets from "widgets/widgets";

const proxyName = "watchtowerProxyHandler";
const headerCacheKey = `${proxyName}__headers`;
const logger = createLogger(proxyName);

export default async function watchtowerProxyHandler(req, res) {
    const { group, service, endpoint } = req.query;

  if (!group || !service) {
    logger.debug("Invalid or missing service '%s' or group '%s'", service, group);
    return res.status(400).json({ error: "Invalid proxy service type" });
  }

  const widget = await getServiceWidget(group, service);

  if (!widget) {
    logger.debug("Invalid or missing widget for service '%s' in group '%s'", service, group);
    return res.status(400).json({ error: "Invalid proxy service type" });
  }

  let headers = cache.get(headerCacheKey);
  if (!headers) {
    headers = {
      "Authorization": `Bearer ${widget.key}`,
    }
    cache.put(headerCacheKey, headers);
  }

  const url = new URL(formatApiCall(widgets[widget.type].api, { endpoint, ...widget }));  
  
  const method = "GET"
  const [status, contentType, data] = await httpProxy(url, {
    method,
    headers,
  });

  const cleanData = data.toString().split("\n").filter(s => s.startsWith("watchtower"))
  const jsonRes={}
  
  cleanData.map(e => e.split(" ")).forEach(strArray => { 
    const [key, value] = strArray
    jsonRes[key] = value
  }) 

  if (status !== 200) {
    logger.error("Error getting data from WatchTower: %d.  Data: %s", status, data);
  }

  if (contentType) res.setHeader("Content-Type", contentType);
  return res.status(status).send(jsonRes);
}
