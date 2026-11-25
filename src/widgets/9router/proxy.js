import cache from "memory-cache";

import getServiceWidget from "utils/config/service-helpers";
import createLogger from "utils/logger";
import { formatApiCall } from "utils/proxy/api-helpers";
import { httpProxy } from "utils/proxy/http";
import widgets from "widgets/widgets";

const proxyName = "9routerProxyHandler";
const tokenCacheKey = `${proxyName}__token`;
const logger = createLogger(proxyName);

function getSetCookie(headers) {
  const raw = headers?.["set-cookie"];
  const value = Array.isArray(raw) ? raw.join(", ") : raw;
  if (!value) return null;
  const match = value.match(/auth_token=[^;]+/);
  return match ? match[0] : null;
}

async function login(loginUrl, password, service) {
  const [status, , , headers] = await httpProxy(loginUrl, {
    method: "POST",
    body: JSON.stringify({ password }),
    headers: {
      "Content-Type": "application/json",
    },
  });

  const token = status === 200 ? getSetCookie(headers) : null;

  if (token) {
    cache.put(`${tokenCacheKey}.${service}`, token);
  } else if (status !== 200) {
    logger.debug(`HTTP ${status} logging into 9Router`);
  }

  return [status, token];
}

export default async function nineRouterProxyHandler(req, res) {
  const { group, service, endpoint, index } = req.query;

  if (group && service) {
    const widget = await getServiceWidget(group, service, index);

    if (!widget) {
      return res.status(404).json({ error: "Service not found" });
    }

    if (!widgets?.[widget.type]?.api) {
      return res.status(403).json({ error: "Service does not support API calls" });
    }

    const url = new URL(formatApiCall(widgets[widget.type].api, { endpoint, ...widget }));

    // The login route is not part of the widget mappings; build it directly.
    const actualLoginUrl = `${widget.url.replace(/\/$/, "")}/api/auth/login`;

    let status;
    let data;

    let token = cache.get(`${tokenCacheKey}.${service}`);
    if (!token) {
      [status, token] = await login(actualLoginUrl, widget.password, service);
      if (status !== 200 || !token) {
        /* v8 ignore next 2 */
        const authStatus = status === 200 ? 401 : status || 401;
        return res.status(authStatus).json({ error: "Failed to authenticate with 9Router" });
      }
    }

    [status, , data] = await httpProxy(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Cookie: token,
      },
    });

    const badRequest = [400, 401, 403].includes(status);

    if (badRequest) {
      cache.del(`${tokenCacheKey}.${service}`);
      [status, token] = await login(actualLoginUrl, widget.password, service);

      if (status !== 200 || !token) {
        /* v8 ignore next 2 */
        const authStatus = status === 200 ? 401 : status || 401;
        return res.status(authStatus).json({ error: "Failed to authenticate with 9Router" });
      }

      [status, , data] = await httpProxy(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Cookie: token,
        },
      });
    }

    if (status !== 200) {
      return res.status(status).send(data);
    }

    return res.send(data);
  }

  return res.status(400).json({ error: "Invalid proxy service type" });
}
