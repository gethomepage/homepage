import cache from "memory-cache";

import getServiceWidget from "utils/config/service-helpers";
import createLogger from "utils/logger";
import { formatApiCall } from "utils/proxy/api-helpers";
import { httpProxy } from "utils/proxy/http";
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

  let dataParsed;
  try {
    dataParsed = JSON.parse(data);
  } catch {
    logger.error("Failed to parse Crowdsec login response, status: %d", status);
    cache.del(`${sessionTokenCacheKey}.${service}`);
    return null;
  }

  if (status !== 200 || !dataParsed.token) {
    logger.error("Failed to login to Crowdsec API, status: %d", status);
    cache.del(`${sessionTokenCacheKey}.${service}`);
    return null;
  }

  const ttl = Math.max(new Date(dataParsed.expire) - new Date(), 1);
  cache.put(`${sessionTokenCacheKey}.${service}`, dataParsed.token, ttl);

  return dataParsed.token;
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

  let token = cache.get(`${sessionTokenCacheKey}.${service}`);
  if (!token) {
    token = await login(widget, service);
  }
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

    let [status, , data] = await httpProxy(url, params);

    if (status === 401) {
      logger.debug("Crowdsec API returned 401, refreshing token and retrying request");
      cache.del(`${sessionTokenCacheKey}.${service}`);
      const refreshedToken = await login(widget, service);

      if (!refreshedToken) {
        return res.status(500).json({ error: "Failed to authenticate with Crowdsec" });
      }

      params.headers.Authorization = `Bearer ${refreshedToken}`;
      [status, , data] = await httpProxy(url, params);
    }

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
