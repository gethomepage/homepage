import cache from "memory-cache";

import { formatApiCall } from "utils/proxy/api-helpers";
import { httpProxy } from "utils/proxy/http";
import getServiceWidget from "utils/config/service-helpers";
import createLogger from "utils/logger";
import widgets from "widgets/widgets";

const proxyName = "shokoProxyHandler";
const sessionTokenCacheKey = `${proxyName}__sessionToken`;
const logger = createLogger(proxyName);

async function login(widget, service) {
  const endpoint = "auth";
  const api = widgets?.[widget.type]?.api;
  const loginUrl = new URL(formatApiCall(api, { endpoint, ...widget }));
  const loginParams = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      user: widget.username,
      pass: widget.password,
      device: "web-ui",
    }),
  };

  // eslint-disable-next-line no-unused-vars
  const [status, contentType, data] = await httpProxy(loginUrl, loginParams);

  try {
    const { apikey } = JSON.parse(data.toString());
    cache.put(`${sessionTokenCacheKey}.${service}`, apikey);
    return { apikey };
  } catch (e) {
    logger.error("Unable to login to Shoko API: %s", e);
  }

  return { apikey: false };
}

export default async function shokoProxyHandler(req, res) {
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

  if (!cache.get(`${sessionTokenCacheKey}.${service}`)) {
    await login(widget, service);
  }

  const endpoint = "v3/Dashboard/SeriesSummary";
  const url = new URL(formatApiCall(widgets[widget.type].api, { endpoint, ...widget }));
  const params = { method: "GET", headers: { apikey: cache.get(`${sessionTokenCacheKey}.${service}`) } };

  let [status, contentType, data] = await httpProxy(url, params);

  if (status === 401) {
    logger.debug("Shoko API rejected the request, attempting to obtain new session token");
    const { apikey } = await login(widget, service);
    params.headers.apikey = apikey;

    [status, contentType, data] = await httpProxy(url, params);
  }

  if (contentType) res.setHeader("Content-Type", contentType);
  return res.status(status).send(data);
}
