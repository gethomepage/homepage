
import { httpProxy } from "utils/proxy/http";
import getServiceWidget from "utils/config/service-helpers";
import createLogger from "utils/logger";
import widgets from "widgets/widgets";

const proxyName = "omadaProxyHandler";
// const tokenCacheKey = `${proxyName}__token`;
const logger = createLogger(proxyName);


async function login(loginUrl, username, password, cversion) {
  let params;
  if (cversion < "4.0.0") {
    // change the parameters of the query string
    params = JSON.stringify({
      "method": "login",
      "params": {
        "name": username,
        "password": password
      }
    });
  } else {
    params = JSON.stringify({
        "username": username,
        "password": password
    });
  }
  const authResponse = await httpProxy(loginUrl, {
      method: "POST",
      body: params,
        headers: {
          "Content-Type": "application/json",
        },
      });
  const data = JSON.parse(authResponse[2]);
  const status = data.errorCode;
  let token = null;
  if (data.errorCode === 0) {
    token = data.result.token;
  } else {
    token = null;
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
      let status;

      let cid;
      let cversion;
      let connectedAp;
      let activeuser;
      let alerts;
      let loginUrl;
      let siteName;
      let requestresponse;
      const {url} = widget;

      const controllerInfoUrl = `${widget.url}/api/info`;
      const cInfoResponse = await httpProxy(controllerInfoUrl, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const cidresult = cInfoResponse[2];

      try {
        cid = JSON.parse(cidresult).result.omadacId;
        cversion = JSON.parse(cidresult).result.controllerVer;
      } catch (e) {
        cversion = "3.2.17";

      }
      if (cversion < "4.0.0") {
        loginUrl = `${widget.url}/api/user/login?ajax`;
      } else if (cversion < "5.0.0") {
        loginUrl = `${widget.url}/api/v2/login`;
      } else {
        loginUrl = `${widget.url}/${cid}/api/v2/login`;
      }

      requestresponse = await login(loginUrl, widget.username, widget.password, cversion);

      if (requestresponse[0] !== 0) {
        const message = requestresponse[1].msg;

        logger.debug(`HTTTP ${status} logging into Omada api: ${requestresponse[1].msg}`);
        return res.status(500).send(message);
      }
      const token= requestresponse[1];
      // Switching to the site we want to gather stats from
      // First, we get the list of sites
      let sitesUrl;
      let body;
      let params;
      let headers;
      let method;
      let sitetoswitch;
      if (cversion < "4.0.0") {
        sitesUrl = `${widget.url}/web/v1/controller?ajax=&token=${token}`;
        body = JSON.stringify({
          "method": "getUserSites",
          "params": {
            "userName": widget.username
          }});
        params = { "token": token };
        headers = { };
        method = "POST";
      } else if (cversion < "5.0.0") {
        sitesUrl = `${widget.url}/api/v2/sites?token=${token}&currentPage=1&currentPageSize=1000`;
        body = {};
        params = { };
        headers = {"Csrf-Token": token };
        method = "GET";

      } else {
        sitesUrl = `${widget.url}/${cid}/api/v2/sites?token=${token}&currentPage=1&currentPageSize=1000`;
        body = {};
        headers = { "Csrf-Token": token };
        method = "GET";
        params = { };
      }

      requestresponse = await httpProxy(sitesUrl, {
        method: method,
        params: params,
        body: body.toString(),
        headers: headers,
      });
      const listresult = JSON.parse(requestresponse[2]);

      if (listresult.errorCode !== 0) {
        logger.debug(`HTTTP ${listresult.errorCode} getting list of sites with message ${listresult.msg}`);
        return res.status(500).send(requestresponse[2]);
      }

      // Switching site is really needed only for Omada 3.x.x controllers

      let switchUrl;

      if (cversion < "4.0.0") {
        sitetoswitch = listresult.result.siteList.filter(site => site.name === widget.site);
        siteName = sitetoswitch[0].siteName;
        switchUrl = `${widget.url}/web/v1/controller?ajax=&token=${token}`;
        method = "POST";
        body = JSON.stringify({
          "method": "switchSite",
          "params": {
            "siteName": siteName,
            "userName": widget.username
          }
        });
        headers = { "Content-Type": "application/json" };
        params = { "token": token };
        requestresponse = await httpProxy(switchUrl, {
          method: method,
          params: params,
          body: body.toString(),
          headers: headers,
        });
        const switchresult = JSON.parse(requestresponse[2]);
        if (switchresult.errorCode !== 0) {
          logger.debug(`HTTTP ${switchresult.errorCode} switching site with message ${switchresult.msg}`);
          return res.status(500).send(switchresult);
        }
      }

      // OK now we are on the correct site. Let's get the stats
      // on modern controller, we need to call two different endpoints
      // on older controller, we can call one endpoint
      if (cversion < "4.0.0") {
        const statsUrl = `${widget.url}/web/v1/controller?getGlobalStat=&token=${token}`;
        const statResponse = await httpProxy(statsUrl, {
          method: "POST",
          params: { "token": token },
          body: JSON.stringify({
            "method": "getGlobalStat",
          }),
          headers: {
            "Content-Type": "application/json",
          },
        });

        const data = JSON.parse(statResponse[2]);
        if (data.errorCode !== 0) {
          return res.status(status).send(data);
        }
        connectedAp = data.result.connectedAp;
        activeuser = data.result.activeUser;
        alerts = data.result.alerts;

      } else {
        let siteStatsUrl;
        let response;

        if (cversion < "5.0.0") {
          siteStatsUrl = `${url}/api/v2/sites/${siteName}/dashboard/overviewDiagram?token=${token}&currentPage=1&currentPageSize=1000`;
        } else {
          siteStatsUrl = `${url}/${cid}/api/v2/sites/${siteName}/dashboard/overviewDiagram?token=${token}&currentPage=1&currentPageSize=1000`;
        }
        response = await httpProxy(siteStatsUrl, {
          method: "GET",
          headers: {
            "Csrf-Token": token,
          },
        });

        const clientresult = JSON.parse(response[2]);
        if (clientresult.errorCode !== 0) {
          logger.debug(`HTTTP ${listresult.errorCode} getting clients stats for site ${widget.site} with message ${listresult.msg}`);
          return res.status(500).send(response[2]);
        }

        activeuser = clientresult.result.totalClientNum;
        connectedAp = clientresult.result.connectedApNum;

        let alertUrl;
        if (cversion >= "5.0.0") {
          alertUrl = `${url}/${cid}/api/v2/sites/${siteName}/alerts/num?token=${token}&currentPage=1&currentPageSize=1000`;
        } else {
          alertUrl = `${url}/api/v2/sites/${siteName}/alerts/num?token=${token}&currentPage=1&currentPageSize=1000`;
        }
        response = await httpProxy(alertUrl, {
          method: "GET",
          headers: {
            "Csrf-Token": token,
          },
        });
        const alertresult = JSON.parse(response[2]);
        alerts = alertresult.result.alertNum;
      }

      return res.send(JSON.stringify({
        "connectedAp": connectedAp,
        "activeUser": activeuser,
        "alerts": alerts
      }));
    }
  }
  return res.status(400).json({ error: "Invalid proxy service type" });
}
