import cache from "memory-cache";

import { httpProxy } from "utils/proxy/http";
import { formatApiCall } from "utils/proxy/api-helpers";
import getServiceWidget from "utils/config/service-helpers";
import createLogger from "utils/logger";
import widgets from "widgets/widgets";

const proxyName = "crowdsecProxyHandler";
const logger = createLogger(proxyName);
const sessionTokenCacheKey = `${proxyName}__sessionToken`;

async function login(widget, service) {
  const url = formatApiCall(widgets[widget.type].loginURL, widget);
  const [status, , data] = await httpProxy(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "User-Agent": "Mozilla/5.0", // Crowdsec requires a user-agent
    },
    body: JSON.stringify({
      machine_id: widget.username,
      password: widget.password,
      scenarios: [],
    }),
  });

  const dataParsed = JSON.parse(data);

  if (!(status === 200) || !dataParsed.token) {
    logger.error("Failed to login to Crowdsec API, status: %d", status);
    cache.del(`${sessionTokenCacheKey}.${service}`);
  }
  cache.put(`${sessionTokenCacheKey}.${service}`, dataParsed.token, new Date(dataParsed.expire) - new Date());
}

export default async function crowdsecProxyHandler(req, res) {
  const { group, service, endpoint, index } = req.query;

  if (!group || !service) {
    logger.error("Invalid or missing service '%s' or group '%s'", service, group);
    return res.status(400).json({ error: "Invalid proxy service type" });
  }

  const widget = await getServiceWidget(group, service, index);
  if (!widget || !widgets[widget.type].api) {
    logger.error("Invalid or missing widget for service '%s' in group '%s'", service, group);
    return res.status(400).json({ error: "Invalid widget configuration" });
  }

  if (!cache.get(`${sessionTokenCacheKey}.${service}`)) {
    await login(widget, service);
  }

  const token = cache.get(`${sessionTokenCacheKey}.${service}`);
  if (!token) {
    return res.status(500).json({ error: "Failed to authenticate with Crowdsec" });
  }

  const url = new URL(formatApiCall(widgets[widget.type].api, { endpoint, ...widget }));

  try {
    const params = {
      method: "GET",
      headers: {
        "User-Agent": "Mozilla/5.0", // Crowdsec requires a user-agent
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    };

    logger.debug("Calling Crowdsec API endpoint: %s", endpoint);

    const [status, , data] = await httpProxy(url, params);

    if (status !== 200) {
      logger.error("Error calling Crowdsec API: %d. Data: %s", status, data);
      return res.status(status).json({ error: "Crowdsec API Error", data });
    }

    return res.status(status).send(data);
  } catch (error) {
    logger.error("Exception calling Crowdsec API: %s", error.message);
    return res.status(500).json({ error: "Crowdsec API Error", message: error.message });
  }
}
