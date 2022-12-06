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

      const loginUrl = `${widget.url}/api/user/login?ajax`;

      let status;
      let contentType;
      let data;
      let result;
      let token;
      if (widget.legacy) {
        [status, token] = await login(loginUrl, widget.username, widget.password);
        if (status !== 200) {
          logger.debug(`HTTTP ${status} logging into Omada api: ${token}`);
          return res.status(status).send(token);
        }
        // Switching to the site we want to gather stats from
        // First, we get the list of sites
        const sitesUrl = `${widget.url}/web/v1/controller?ajax=&token=${token}`;
        [status, contentType, data] = await httpProxy(sitesUrl, {
          method: "POST",
          params: { "token": token },
          body: JSON.stringify({
            "method": "getUserSites",
            "params": {
              "userName": widget.username
            }
          }),
          headers: {
            "Content-Type": "application/json",
          },
        });
        const listresult = JSON.parse(data);
        if (listresult.errorCode !== 0) {
          logger.debug(`HTTTP ${listresult.errorCode} getting list of sites with message ${listresult.msg}`);
          return res.status(status).send(data);
        }

        const sites = JSON.parse(data);

        const sitetoswitch = sites.result.siteList.filter(site => site.name === widget.site);

        const { siteName } = sitetoswitch[0];

        const switchUrl = `${widget.url}/web/v1/controller?ajax=&token=${token}`;

        [status, contentType, result] = await httpProxy(switchUrl, {
          method: "POST",
          params: { "token": token },
          body: JSON.stringify({
            "method": "switchSite",
            "params": { "siteName": siteName, "userName": widget.username }
          }),
          headers: {
            "Content-Type": "application/json",
          },
        });
        const switchresult = JSON.parse(result);

        if (switchresult.errorCode !== 0) {
          logger.debug(`HTTTP ${switchresult.errorCode} switching site with message ${switchresult.msg}`);
          return res.status(status).send(data);
        }

        const url = `${widget.url}/web/v1/controller?globalStat=&token=${token}`;

        // eslint-disable-next-line prefer-const
        [status, contentType, result] = await httpProxy(url, {
          method: "POST",
          params: { "token": token },
          body: JSON.stringify({
            "method": "getGlobalStat",
          }),
          headers: {
            "Content-Type": "application/json",
          },
        });

        data = JSON.parse(result);


        if (data.errorCode !== 0) {
          return res.status(status).send(data);
        }

        return res.send(data.result);
      } else {
        // Working on it but I can't test it
        logger.debug(`unsupported for now but I'm working on it`);
      }
    }
  }

  return res.status(400).json({ error: "Invalid proxy service type" });
}
