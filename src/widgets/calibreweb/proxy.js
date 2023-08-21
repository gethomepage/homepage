import { xml2json } from "xml-js";

import { formatApiCall } from "utils/proxy/api-helpers";
import { httpProxy } from "utils/proxy/http";
import getServiceWidget from "utils/config/service-helpers";
import createLogger from "utils/logger";
import widgets from "widgets/widgets";

const proxyName = "calibreWebProxyHandler";
const logger = createLogger(proxyName);

async function getWidget(req) {
  const { group, service } = req.query;

  if (!group || !service) {
    logger.debug("Invalid or missing service '%s' or group '%s'", service, group);
    return null;
  }

  const widget = await getServiceWidget(group, service);

  if (!widget) {
    logger.debug("Invalid or missing widget for service '%s' in group '%s'", service, group);
    return null;
  }

  return widget;
}

async function apiCall(widget, endpoint) {
  const { api } = widgets[widget.type];
  const apiUrl = new URL(formatApiCall(api, { endpoint, ...widget }));
  const headers = {
      Authorization: `Basic ${Buffer.from(`${widget.username}:${widget.password}`).toString("base64")}`
  };

  const [status, contentType, data] = await httpProxy(apiUrl, {
    withCredentials: true,
    credentials: "include",
    headers,
  });

  if (status !== 200) {
    logger.error("Error getting data from CalibreWeb: %s status %d. Data: %s", apiUrl, status, data);
    return { status, contentType, data: null };
  }

  try {
    const dataDecoded = xml2json(data.toString(), { compact: true });
    return {status, data: JSON.parse(dataDecoded), contentType};
  } catch (e) {
    logger.error("Error decoding CalibreWeb API data. Data: %s", data.toString());
    return {status, data: null, contentType};
  }
}

export default async function calibreWebProxyHandler(req, res) {
  const widget = await getWidget(req);
  
  const { endpoint } = req.query;

  if (!widget) {
    return res.status(400).json({ error: "Invalid proxy service type" });
  }

  const { status, data } = await apiCall(widget, endpoint);

  if (status !== 200) {
    return res.status(status).json({error: {message: "HTTP error communicating with CalibreWeb API", data: Buffer.from(data).toString()}});
  }

  return res.status(status).json(data);
}
