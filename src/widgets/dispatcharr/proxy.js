import cache from "memory-cache";

import getServiceWidget from "utils/config/service-helpers";
import createLogger from "utils/logger";
import { formatApiCall } from "utils/proxy/api-helpers";
import { httpProxy } from "utils/proxy/http";
import widgets from "widgets/widgets";

const proxyName = "dispatcharrProxyHandler";
const tokenCacheKey = `${proxyName}__token`;
const logger = createLogger(proxyName);

async function login(loginUrl, username, password, service) {
  const authResponse = await httpProxy(loginUrl, {
    method: "POST",
    body: JSON.stringify({ username, password }),
    headers: {
      "Content-Type": "application/json",
    },
  });

  const status = authResponse[0];
  let data = authResponse[2];
  try {
    data = JSON.parse(Buffer.from(authResponse[2]).toString());

    if (status === 200) {
      cache.put(`${tokenCacheKey}.${service}`, data.access);
    } else {
      throw new Error(`HTTP ${status} logging into dispatcharr`);
    }
  } catch (e) {
    logger.error(`Error ${status} logging into dispatcharr`, JSON.stringify(data));
    return [status, null];
  }
  return [status, data.access];
}

export default async function dispatcharrProxyHandler(req, res) {
  const { group, service, endpoint, index } = req.query;

  if (group && service) {
    const widget = await getServiceWidget(group, service, index);

    if (!widgets?.[widget.type]?.api) {
      return res.status(403).json({ error: "Service does not support API calls" });
    }

    if (widget) {
      const url = new URL(formatApiCall(widgets[widget.type].api, { endpoint, ...widget }));
      const loginUrl = formatApiCall(widgets[widget.type].api, {
        endpoint: widgets[widget.type].mappings["token"].endpoint,
        ...widget,
      });

      let status;
      let data;

      let token = cache.get(`${tokenCacheKey}.${service}`);
      if (!token) {
        [status, token] = await login(loginUrl, widget.username, widget.password, service);
        if (!token) {
          logger.debug(`HTTP ${status} logging into Dispatcharr}`);
          return res.status(status).send({ error: "Failed to authenticate with Dispatcharr" });
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
      let isEmpty = false;

      try {
        const json = JSON.parse(data.toString("utf-8"));
        isEmpty = Array.isArray(json.items) && json.items.length === 0;
      } catch (err) {
        logger.error("Failed to parse Dispatcharr response JSON:", err);
      }

      if (badRequest || isEmpty) {
        if (badRequest) {
          logger.debug(`HTTP ${status} retrieving data from Dispatcharr, logging in and trying again.`);
        } else {
          logger.debug(`Received empty list from Dispatcharr, logging in and trying again.`);
        }
        cache.del(`${tokenCacheKey}.${service}`);
        [status, token] = await login(loginUrl, widget.username, widget.password, service);

        if (status !== 200) {
          logger.debug(`HTTP ${status} logging into Dispatcharr: ${JSON.stringify(data)}`);
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
