import cache from "memory-cache";

import getServiceWidget from "utils/config/service-helpers";
import { formatApiCall } from "utils/proxy/api-helpers";
import { httpProxy } from "utils/proxy/http";
import widgets from "widgets/widgets";
import createLogger from "utils/logger";

const proxyName = "beszelProxyHandler";
const tokenCacheKey = `${proxyName}__token`;
const logger = createLogger(proxyName);

async function login(loginUrl, username, password, service) {
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
      cache.put(`${tokenCacheKey}.${service}`, data.token);
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
      let authEndpointVersion = "authv1";
      if (widget.version === 2) authEndpointVersion = "authv2";
      const loginUrl = formatApiCall(widgets[widget.type].api, {
        endpoint: widgets[widget.type].mappings[authEndpointVersion].endpoint,
        ...widget,
      });

      let status;
      let data;

      let token = cache.get(`${tokenCacheKey}.${service}`);
      if (!token) {
        [status, token] = await login(loginUrl, widget.username, widget.password, service);
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

      if ([400, 403].includes(status)) {
        logger.debug(`HTTP ${status} retrieving data from Beszel, logging in and trying again.`);
        cache.del(`${tokenCacheKey}.${service}`);
        [status, token] = await login(loginUrl, widget.username, widget.password, service);

        if (status !== 200) {
          logger.debug(`HTTP ${status} logging into Beszel: ${JSON.stringify(data)}`);
          return res.status(status).send(data);
        }

        // eslint-disable-next-line no-unused-vars
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
