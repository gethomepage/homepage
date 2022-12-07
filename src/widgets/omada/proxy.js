import cache from "memory-cache";

import { addCookieToJar, setCookieHeader } from "../../utils/proxy/cookie-jar";

import { httpProxy } from "utils/proxy/http";
import getServiceWidget from "utils/config/service-helpers";
import createLogger from "utils/logger";
import widgets from "widgets/widgets";

const proxyName = "omadaProxyHandler";
const tokenCacheKey = `${proxyName}__token`;
const logger = createLogger(proxyName);


async function login(loginUrl, username, password, legacy) {

  if (legacy) {

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

  return null
}


export default async function omadaProxyHandler(req, res) {
  const { group, service } = req.query;

  if (group && service) {
    const widget = await getServiceWidget(group, service);

    if (!widgets?.[widget.type]?.api) {
      return res.status(403).json({ error: "Service does not support API calls" });
    }

    if (widget) {
      if (widget.legacy) {
        const loginUrl = `${widget.url}/api/user/login?ajax`;
        let status;
        let contentType;
        let data;
        let result;
        let token;
        // eslint-disable-next-line prefer-const
        [status, token] = await login(loginUrl, widget.username, widget.password, widget.legacy);
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

        // eslint-disable-next-line prefer-const,no-unused-vars
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
      }
      // code for modern API, not working yet
      // Working on it but I can't test it
        const {url} = widget;
        const controllerInfoUrl = `${url}/api/info`;
        const cInfoResponse = await httpProxy(controllerInfoUrl, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });
        const cidresult = cInfoResponse[2];

        const cid = JSON.parse(cidresult).result.omadacId;
        const cversion = JSON.parse(cidresult).result.controllerVer;
        let loginUrl;
        if (cversion >= "5.0.0"){
          loginUrl = `${url}/${cid}/api/v2/login`;
        } else {
          loginUrl = `${url}/api/v2/login`;
        }

        const params = {
          method: "POST",
          body: JSON.stringify({ "username": widget.username, "password": widget.password }),
          headers: {"Content-Type": "application/json"} };
        setCookieHeader(url, params);
        const authResponse = await httpProxy(loginUrl,params);
        addCookieToJar(url, authResponse[3]);
        setCookieHeader(url, params);

        const status = authResponse[0];
        const data = JSON.parse(authResponse[2]);
        const {token} = data.result;
        if (data.errorCode !== 0) {
          logger.debug(`HTTTP ${data.errorCode} logging into Omada api: ${data.error}`);
          return res.status(status).send(token);
        }
        let sitesUrl;
        if (cversion >= "5.0.0") {
          sitesUrl = `${url}/${cid}/api/v2/sites?token=${token}&currentPage=1&currentPageSize=1000`;
        } else {
          sitesUrl = `${url}/api/v2/sites?token=${token}&currentPage=1&currentPageSize=1000`;
        }
        let response;
        response = await httpProxy(sitesUrl, {
          method: "GET",
          headers: {
            "Csrf-Token": token,
          },
        });

        const listresult = JSON.parse(response[2]);
        if (listresult.errorCode !== 0) {
          logger.debug(`HTTTP ${listresult.errorCode} getting list of sites with message ${listresult.msg}`);
          return res.status(status).send(data);
        }

      const sites = JSON.parse(response[2]);

      const sitetoswitch = sites.result.data.filter(site => site.name === widget.site);
      const siteName = sitetoswitch[0].id;

      let switchUrl;
      if (cversion >= "5.0.0") {
        switchUrl = `${url}/${cid}/api/v2/sites/${siteName}/cmd/switch?token=${token}`;
      } else {
        switchUrl = `${url}/api/v2/sites/${siteName}/cmd/switch?token=${token}`;
      }
      response = await httpProxy(switchUrl, {
        method: "POST",
        headers: {
          "Csrf-Token": token,
        },
      });

      const switchresult = JSON.parse(response[2]);
      if (switchresult.errorCode !== 0) {

        logger.debug(`HTTTP ${listresult.errorCode} switching to site ${widget.site} with message ${listresult.msg}`);
        return res.status(status).send(data);
      }

      // get the number of devices connected to the site

      let clientUrl;
      if (cversion >= "5.0.0") {
        clientUrl=`${url}/${cid}/api/v2/sites/${siteName}/dashboard/overviewDiagram?token=${token}&currentPage=1&currentPageSize=1000`;
      } else {
        clientUrl=`${url}/api/v2/sites/${siteName}/dashboard/overviewDiagram?token=${token}&currentPage=1&currentPageSize=1000`;
      }
      response = await httpProxy(clientUrl, {
        method: "GET",
        headers: {
          "Csrf-Token": token,
        },
      });
      const clientresult = JSON.parse(response[2]);
      if (clientresult.errorCode !== 0) {
        logger.debug(`HTTTP ${listresult.errorCode} getting clients stats for site ${widget.site} with message ${listresult.msg}`);
        return res.status(status).send(data);
      }
      const activeuser = clientresult.result.totalClientNum;
      const connectedAp = clientresult.result.connectedApNum;

      let alertUrl;
      if (cversion >= "5.0.0") {
        alertUrl=`${url}/${cid}/api/v2/sites/${siteName}/alerts/num?token=${token}&currentPage=1&currentPageSize=1000`;
      } else {
        alertUrl=`${url}/api/v2/sites/${siteName}/alerts/num?token=${token}&currentPage=1&currentPageSize=1000`;
      }
      response = await httpProxy(alertUrl, {
        method: "GET",
        headers: {
          "Csrf-Token": token,
        },
      });

      const alertresult = JSON.parse(response[2]);
      const alerts = alertresult.result.alertNum;



      const returnvalue = JSON.stringify({
        "connectedAp": connectedAp,
        "activeUser": activeuser,
        "alerts": alerts
      });
      return res.send(returnvalue);
    }
  }

  return res.status(400).json({ error: "Invalid proxy service type" });
}
