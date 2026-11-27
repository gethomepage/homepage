import cache from "memory-cache";

import getServiceWidget from "utils/config/service-helpers";
import createLogger from "utils/logger";
import { formatApiCall } from "utils/proxy/api-helpers";
import { httpProxy } from "utils/proxy/http";
import widgets from "widgets/widgets";

const proxyName = "beszelProxyHandler";
const tokenCacheKey = `${proxyName}__token`;
const logger = createLogger(proxyName);
const AUTH_COLLECTION_PATTERN = /^[A-Za-z_][A-Za-z0-9_]*$/;

function sanitizedAuthCollection(authCollection) {
  if (typeof authCollection === "string" && AUTH_COLLECTION_PATTERN.test(authCollection)) {
    return authCollection;
  }
  return null;
}

function getAuthEndpoint(widget) {
  const collection = sanitizedAuthCollection(widget.authCollection);
  if (collection) {
    return `collections/${collection}/auth-with-password`;
  }
  const authEndpointVersion = widget.version === 2 ? "authv2" : "authv1";
  return widgets[widget.type].mappings[authEndpointVersion].endpoint;
}

function getTokenCacheKey(service, widget) {
  const collection = sanitizedAuthCollection(widget.authCollection);
  return collection ? `${tokenCacheKey}.${service}.${collection}` : `${tokenCacheKey}.${service}`;
}

async function login(loginUrl, username, password, cachedTokenKey) {
  const authResponse = await httpProxy(loginUrl, {
    method: "POST",
    body: JSON.stringify({ identity: username, password }),
    headers: {
      "Content-Type": "application/json",
    },
  });

  const status = authResponse[0];
  let data = authResponse[2];
  try {
    data = JSON.parse(Buffer.from(authResponse[2]).toString());

    if (status === 200) {
      cache.put(cachedTokenKey, data.token);
    }
  } catch (e) {
    logger.error(`Error ${status} logging into beszel`, JSON.stringify(authResponse[2]));
  }
  return [status, data.token ?? data];
}

export default async function beszelProxyHandler(req, res) {
  const { group, service, endpoint, index } = req.query;

  if (group && service) {
    const widget = await getServiceWidget(group, service, index);

    if (!widgets?.[widget.type]?.api) {
      return res.status(403).json({ error: "Service does not support API calls" });
    }

    if (widget) {
      const url = new URL(formatApiCall(widgets[widget.type].api, { endpoint, ...widget }));
      const loginUrl = formatApiCall(widgets[widget.type].api, {
        endpoint: getAuthEndpoint(widget),
        ...widget,
      });

      let status;
      let data;

      const cachedTokenKey = getTokenCacheKey(service, widget);
      let token = cache.get(cachedTokenKey);
      if (!token) {
        [status, token] = await login(loginUrl, widget.username, widget.password, cachedTokenKey);
        if (status !== 200) {
          logger.debug(`HTTP ${status} logging into Beszel: ${JSON.stringify(token)}`);
          return res.status(status).send(token);
        }
      }

      [status, , data] = await httpProxy(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const badRequest = [400, 401, 403].includes(status);
      const text = data.toString("utf-8");
      let isEmpty = false;

      try {
        const json = JSON.parse(text);
        isEmpty = Array.isArray(json.items) && json.items.length === 0;
      } catch (err) {
        logger.debug("Failed to parse Beszel response JSON:", err);
      }

      if (badRequest || isEmpty) {
        if (badRequest) {
          logger.debug(`HTTP ${status} retrieving data from Beszel, logging in and trying again.`);
        } else {
          logger.debug(`Received empty list from Beszel, logging in and trying again.`);
        }
        cache.del(cachedTokenKey);
        [status, token] = await login(loginUrl, widget.username, widget.password, cachedTokenKey);

        if (status !== 200) {
          logger.debug(`HTTP ${status} logging into Beszel: ${JSON.stringify(data)}`);
          return res.status(status).send(data);
        }

        [status, , data] = await httpProxy(url, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
      }

      if (status !== 200) {
        return res.status(status).send(data);
      }

      return res.send(data);
    }
  }

  return res.status(400).json({ error: "Invalid proxy service type" });
}
