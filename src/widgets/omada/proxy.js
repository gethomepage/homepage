import cache from "memory-cache";


import { httpProxy } from "utils/proxy/http";
import getServiceWidget from "utils/config/service-helpers";
import createLogger from "utils/logger";
import widgets from "widgets/widgets";

const proxyName = "omadaProxyHandler";
const tokenCacheKey = `${proxyName}__token`;
const logger = createLogger(proxyName);


async function login(loginUrl, username, password) {
  const authResponse = await httpProxy(loginUrl,
    {
      method: "POST",
      body: JSON.stringify({ "method": "login",
    "params": {
    "name": username,
      "password": password
  } }),
      headers: {
        "Content-Type": "application/json",
      },
    }
    );
  const status = authResponse[0];
  const data = JSON.parse(authResponse[2]);
  const {token} = data.result;
  try {
    if (status === 200) {
      cache.put(tokenCacheKey, token); // expiration -5 minutes
    }
  } catch (e) {
    logger.error(`Error ${status} logging into Omada`, authResponse[2]);
  }
  return [status, token ?? data];
}

export default async function omadaProxyHandler(req, res) {
  const { group, service } = req.query;

  if (group && service) {
    const widget = await getServiceWidget(group, service);

    if (!widgets?.[widget.type]?.api) {
      return res.status(403).json({ error: "Service does not support API calls" });
    }

    if (widget) {

      // const url = new URL(formatApiCall(widgets[widget.type].api, { endpoint, ...widget }));

      const loginUrl = `${widget.url}/api/user/login?ajax`;

      let status;
      let contentType;
      let data;
      let result;
      let token;

      [status, token] = await login(loginUrl, widget.username, widget.password);
      if (status !== 200) {
          logger.debug(`HTTTP ${status} logging into Omada api: ${token}`);
          return res.status(status).send(token);
        }

      const url = `${widget.url}/web/v1/controller?globalStat=&token=${token}`;

      // eslint-disable-next-line prefer-const
      [status, contentType, result] = await httpProxy(url, {
        method: "POST",
        params: {"token": token},
        body: JSON.stringify({
          "method": "getGlobalStat",
        }),
        headers: {
          "Content-Type": "application/json",
        },
        });

      data = JSON.parse(result);
      if (status === 403) {
        logger.debug(`HTTTP ${status} retrieving data from Omada api, logging in and trying again.`);
        cache.del(tokenCacheKey);
        [status, token] = await login(loginUrl, widget.username, widget.password);

        if (status !== 200) {
          logger.debug(`HTTTP ${status} logging into Omada api: ${data}`);
          return res.status(status).send(data);
        }

        // eslint-disable-next-line no-unused-vars
        [status, contentType, data] = await httpProxy(url, {
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

      return res.send(data.result);
    }
  }

  return res.status(400).json({ error: "Invalid proxy service type" });
}
