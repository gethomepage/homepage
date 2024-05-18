import cache from "memory-cache";

import getServiceWidget from "utils/config/service-helpers";
import { formatApiCall } from "utils/proxy/api-helpers";
import { httpProxy } from "utils/proxy/http";
import widgets from "widgets/widgets";
import createLogger from "utils/logger";

const proxyName = "fireshareProxyHandler";
const logger = createLogger(proxyName);
const sessionTokenCacheKey = `${proxyName}__sessionToken`;

async function login(widget, service) {
  const url = formatApiCall(widgets[widget.type].api, { ...widget, endpoint: "login" });
  logger.info(`url: ${url}`);
  logger.info(`username: ${widget.username}, password: ${widget.password}`);
  const [, , , responseHeaders] = await httpProxy(url, {
    method: "POST",
    body: JSON.stringify({ username: widget.username, password: widget.password }),
    headers: {
      "Content-Type": "application/json"
    }
  });

  try {
    logger.info(responseHeaders);
    const rememberTokenCookie = responseHeaders["set-cookie"]
      .find((cookie) => cookie.startsWith("remember_token="))
      .split(";")[0]
      .replace("remember_token=", "");
    logger.info(`remember_token: ${rememberTokenCookie}`);
    cache.put(`${sessionTokenCacheKey}.${service}`, rememberTokenCookie);
    return rememberTokenCookie;
  } catch (e) {
    logger.error(`Error retrieving 'remember_token' cookie for service: ${service}`);
    cache.del(`${sessionTokenCacheKey}.${service}`);
    return null;
  }
}

export default async function fireshareProxyHandler(req, res) {
  const { group, service } = req.query;

  if (group && service) {
    const widget = await getServiceWidget(group, service);

    if (!widgets?.[widget.type]?.api) {
      return res.status(403).json({ error: "Service does not support API calls" });
    }

    if (widget) {
      let token = cache.get(`${sessionTokenCacheKey}.${service}`);
      if (!token) {
        token = await login(widget, service);
        if (!token) {
          return res.status(500).json({ error: "Failed to authenticate with Fireshare" });
        }
      }
      const [, , data] = await httpProxy(
        formatApiCall(widgets[widget.type].api, { ...widget, endpoint: "videos?sort=updated_at+desc" }),
        {
          headers: {
            "Content-Type": "application/json",
            Cookie: `remember_token=${token}`
          }
        }
      );

      return res.json(JSON.parse(data));
    }
  }

  return res.status(400).json({ error: "Invalid proxy service type" });
}
