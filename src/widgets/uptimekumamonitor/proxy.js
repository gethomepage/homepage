import { formatApiCall } from "utils/proxy/api-helpers";
import { httpProxy } from "utils/proxy/http";
import getServiceWidget from "utils/config/service-helpers";
import createLogger from "utils/logger";

const logger = createLogger("uptimekumamonitorProxyHandler");

export default async function uptimekumamonitorProxyHandler(req, res) {
  const { group, service } = req.query;

  if (!group || !service) {
    logger.debug("Invalid or missing service '%s' or group '%s'", service, group);
    return res.status(400).json({ error: "Invalid proxy service type" });
  }
  const widget = await getServiceWidget(group, service);
  if (!widget) {
    logger.debug("Invalid or missing widget for service '%s' in group '%s'", service, group);
    return res.status(400).json({ error: "Invalid proxy service type" });
  }
  const url = new URL(formatApiCall("{url}/api/badge/{monitor}/status", { ...widget }));
  const params = { 
    method: "GET", 
    body: null
  };
  const [status, contentType, data] = await httpProxy(url, params);
  if (contentType) res.setHeader("Content-Type", contentType);
  return res.status(200).json({data: data.toString()});
}
