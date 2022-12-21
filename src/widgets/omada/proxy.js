
import { httpProxy } from "utils/proxy/http";
import getServiceWidget from "utils/config/service-helpers";
import createLogger from "utils/logger";
import widgets from "widgets/widgets";

const proxyName = "omadaProxyHandler";

const logger = createLogger(proxyName);


async function login(loginUrl, username, password, controllerVersionMajor) {
  const params = {
    username: username,
    password: password
  }

  if (controllerVersionMajor < 4) {
    params.method = "login";
    params.name = username;
  }
  
  const [status, contentType, data] = await httpProxy(loginUrl, {
    method: "POST",
    body: JSON.stringify(params),
    headers: {
      "Content-Type": "application/json",
    },
  });

  return [status, JSON.parse(data.toString())];
}


export default async function omadaProxyHandler(req, res) {
  const { group, service } = req.query;

  if (group && service) {
    const widget = await getServiceWidget(group, service);

    if (!widgets?.[widget.type]?.api) {
      return res.status(403).json({ error: "Service does not support API calls" });
    }

    if (widget) {

      const {url} = widget;

      const controllerInfoURL = `${widget.url}/api/info`;

      let [status, contentType, data] = await httpProxy(controllerInfoURL, {
          headers: {
            "Content-Type": "application/json",
          },
      });

      if (status !== 200) {
        logger.error("Unable to retrieve Omada controller info");
        return res.status(status).json({error: {message: `HTTP Error ${status}`, url: controllerInfoURL, data: data}});
      }

      const cId = JSON.parse(data).result.omadacId;
      let controllerVersion;

      try {
        controllerVersion = JSON.parse(data).result.controllerVer;
      } catch (e) {
        // fallback to this random version?
        controllerVersion = "3.2.17"
      }

      const controllerVersionMajor = parseInt(controllerVersion.split('.')[0], 10)

      if (![3,4,5].includes(controllerVersionMajor)) {
        return res.status(500).json({error: {message: "Error determining controller version", data}});
      }

      let loginUrl;

      switch (controllerVersionMajor) {
        case 3:
          loginUrl = `${widget.url}/api/user/login?ajax`;
          break;
        case 4:
          loginUrl = `${widget.url}/api/v2/login`;
          break;
        case 5:
          loginUrl = `${widget.url}/${cId}/api/v2/login`;
          break;
        default:
          break;
      }
      
      const [loginStatus, loginResponseData] = await login(loginUrl, widget.username, widget.password, controllerVersionMajor);

      if (loginStatus !== 200 || loginResponseData.errorCode > 0) {
        return res.status(requestresponse[0]).json({error: {message: "Error logging in to Oamda controller", url: loginUrl, data: loginResponseData}});
      }

      const token = loginResponseData.result.token;
      
      // List sites
      let sitesUrl;
      let body = {};
      let params = { token };
      let headers = { "Csrf-Token": token };
      let method = "GET";

      switch (controllerVersionMajor) {
        case 3:
          sitesUrl = `${widget.url}/web/v1/controller?ajax=&token=${token}`;
          body = {
            "method": "getUserSites",
            "params": {
              "userName": widget.username
            }
          };
          method = "POST";
          break;
        case 4:
          sitesUrl = `${widget.url}/api/v2/sites?token=${token}&currentPage=1&currentPageSize=1000`;          
          break;
        case 5:
          sitesUrl = `${widget.url}/${cId}/api/v2/sites?token=${token}&currentPage=1&currentPageSize=1000`;
          break;
      }
      
      [status, contentType, data] = await httpProxy(sitesUrl, {
        method,
        params,
        body: JSON.stringify(body),
        headers,
      });

      const sitesResponseData = JSON.parse(data);

      let site;

      let connectedAp;
      let activeUser;
      let connectedSwitches;
      let connectedGateways;
      let alerts;

      if (sitesResponseData.errorCode > 0) {
        logger.debug(`HTTTP ${status} getting sites list: ${requestresponse[2].msg}`);
        return res.status(status).json({error: {message: "Error getting sites list", url, data: requestresponse[2]}});
      }

      // on modern controller, we need to call two different endpoints
      // on older controller, we can call one endpoint

      if (controllerVersionMajor === 3) {

        // Switching site is really needed only for Omada 3.x.x controllers
  
        let switchUrl;
  
        site = listresult.result.siteList.filter(site => site.name === widget.site);
        siteName = site[0].siteName;
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
          method,
          params,
          body: body.toString(),
          headers,
        });
        const switchresult = JSON.parse(requestresponse[2]);
        if (switchresult.errorCode !== 0) {
          logger.debug(`HTTTP ${requestresponse[0]} getting sites list: ${requestresponse[2]}`);
          return res.status(requestresponse[0]).json({error: {message: "Error switching site", url, data: requestresponse[2]}});
        }
        
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
          return res.status(statResponse[0]).json({error: {message: "Error getting stats", url, data: statResponse[2]}});
        }
        connectedAp = data.result.connectedAp;
        activeUser = data.result.activeUser;
        alerts = data.result.alerts;

      } else if (controllerVersionMajor === 4 || controllerVersionMajor === 5) {
        site = sitesResponseData.result.data.find(site => site.name === widget.site);

        if (site.length === 0) {
          return res.status(requestresponse[0]).json({error: {message: `Site ${widget.site} is not found`, url, data}});
        }

        const siteName = (controllerVersionMajor === 5) ? site.id : site.key;
        const siteStatsUrl = (controllerVersionMajor === 4) ? 
          `${url}/api/v2/sites/${siteName}/dashboard/overviewDiagram?token=${token}&currentPage=1&currentPageSize=1000` :
          `${url}/${cId}/api/v2/sites/${siteName}/dashboard/overviewDiagram?token=${token}&currentPage=1&currentPageSize=1000`;

        [status, contentType, data] = await httpProxy(siteStatsUrl, {
          headers: {
            "Csrf-Token": token,
          },
        });

        const siteResponseData = JSON.parse(data);
        
        if (status !== 200 || siteResponseData.errorCode > 0) {
          logger.debug(`HTTP ${status} getting stats for site ${widget.site} with message ${listresult.msg}`);
          return res.status(500).send(data);
        }

        activeUser = siteResponseData.result.totalClientNum;
        connectedAp = siteResponseData.result.connectedApNum;
        connectedGateways = siteResponseData.result.connectedGatewayNum;
        connectedSwitches = siteResponseData.result.connectedSwitchNum;

        const alertUrl = (controllerVersionMajor === 4) ? 
          `${url}/api/v2/sites/${siteName}/alerts/num?token=${token}&currentPage=1&currentPageSize=1000` :
          `${url}/${cId}/api/v2/sites/${siteName}/alerts/num?token=${token}&currentPage=1&currentPageSize=1000`;

        [status, contentType, data] = await httpProxy(alertUrl, {
          headers: {
            "Csrf-Token": token,
          },
        });
        const alertResponseData = JSON.parse(data);
        alerts = alertResponseData.result.alertNum;
      }

      return res.send(JSON.stringify({
        connectedAp,
        activeUser,
        alerts,
        connectedGateways,
        connectedSwitches,
      }));
    }
  }
  
  return res.status(400).json({ error: "Invalid proxy service type" });
}
