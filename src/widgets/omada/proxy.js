import { httpProxy } from "utils/proxy/http";
import getServiceWidget from "utils/config/service-helpers";
import createLogger from "utils/logger";

const proxyName = "omadaProxyHandler";

const logger = createLogger(proxyName);

async function login(loginUrl, username, password, controllerVersionMajor) {
  const params = {
    username,
    password,
  };

  if (controllerVersionMajor === 3) {
    params.method = "login";
    params.params = {
      name: username,
      password,
    };
  }

  // eslint-disable-next-line no-unused-vars
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
  const { group, service, index } = req.query;

  if (group && service) {
    const widget = await getServiceWidget(group, service, index);

    if (widget) {
      const { url } = widget;

      const controllerInfoURL = `${url}/api/info`;

      let [status, contentType, data] = await httpProxy(controllerInfoURL, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (status !== 200) {
        logger.error("Unable to retrieve Omada controller info");
        return res.status(status).json({ error: { message: `HTTP Error ${status}`, url: controllerInfoURL, data } });
      }

      let cId;
      let controllerVersion;

      try {
        cId = JSON.parse(data).result.omadacId;
        controllerVersion = JSON.parse(data).result.controllerVer;
      } catch (e) {
        controllerVersion = "3.2.x";
      }

      const controllerVersionMajor = parseInt(controllerVersion.split(".")[0], 10);

      if (![3, 4, 5].includes(controllerVersionMajor)) {
        return res.status(500).json({ error: { message: "Error determining controller version", data } });
      }

      let loginUrl;

      switch (controllerVersionMajor) {
        case 3:
          loginUrl = `${url}/api/user/login?ajax`;
          break;
        case 4:
          loginUrl = `${url}/api/v2/login`;
          break;
        case 5:
          loginUrl = `${url}/${cId}/api/v2/login`;
          break;
        default:
          break;
      }

      const [loginStatus, loginResponseData] = await login(
        loginUrl,
        widget.username,
        widget.password,
        controllerVersionMajor,
      );

      if (loginStatus !== 200 || loginResponseData.errorCode > 0) {
        return res
          .status(status)
          .json({ error: { message: "Error logging in to Oamda controller", url: loginUrl, data: loginResponseData } });
      }

      const { token } = loginResponseData.result;

      let sitesUrl;
      let body = {};
      let params = { token };
      let headers = { "Csrf-Token": token };
      let method = "GET";

      switch (controllerVersionMajor) {
        case 3:
          sitesUrl = `${url}/web/v1/controller?ajax=&token=${token}`;
          body = {
            method: "getUserSites",
            params: {
              userName: widget.username,
            },
          };
          method = "POST";
          break;
        case 4:
          sitesUrl = `${url}/api/v2/sites?token=${token}&currentPage=1&currentPageSize=1000`;
          break;
        case 5:
          sitesUrl = `${url}/${cId}/api/v2/sites?token=${token}&currentPage=1&currentPageSize=1000`;
          break;
        default:
          break;
      }

      [status, contentType, data] = await httpProxy(sitesUrl, {
        method,
        params,
        body: JSON.stringify(body),
        headers,
      });

      const sitesResponseData = JSON.parse(data);

      if (status !== 200 || sitesResponseData.errorCode > 0) {
        logger.debug(`HTTP ${status} getting sites list: ${sitesResponseData.msg}`);
        return res
          .status(status)
          .json({ error: { message: "Error getting sites list", url, data: sitesResponseData } });
      }

      const site =
        controllerVersionMajor === 3
          ? sitesResponseData.result.siteList.find((s) => s.name === widget.site)
          : sitesResponseData.result.data.find((s) => s.name === widget.site);

      if (!site) {
        return res.status(status).json({ error: { message: `Site ${widget.site} is not found`, url: sitesUrl, data } });
      }

      let siteResponseData;

      let connectedAp;
      let activeUser;
      let connectedSwitches;
      let connectedGateways;
      let alerts;

      if (controllerVersionMajor === 3) {
        // Omada v3 controller requires switching site
        const switchUrl = `${url}/web/v1/controller?ajax=&token=${token}`;
        method = "POST";
        body = {
          method: "switchSite",
          params: {
            siteName: site.siteName,
            userName: widget.username,
          },
        };
        headers = { "Content-Type": "application/json" };
        params = { token };

        [status, contentType, data] = await httpProxy(switchUrl, {
          method,
          params,
          body: JSON.stringify(body),
          headers,
        });

        const switchResponseData = JSON.parse(data);
        if (status !== 200 || switchResponseData.errorCode > 0) {
          logger.error(`HTTP ${status} getting sites list: ${data}`);
          return res.status(status).json({ error: { message: "Error switching site", url: switchUrl, data } });
        }

        const statsUrl = `${url}/web/v1/controller?getGlobalStat=&token=${token}`;
        [status, contentType, data] = await httpProxy(statsUrl, {
          method,
          params,
          body: JSON.stringify({
            method: "getGlobalStat",
          }),
          headers,
        });

        siteResponseData = JSON.parse(data);

        if (status !== 200 || siteResponseData.errorCode > 0) {
          return res.status(status).json({ error: { message: "Error getting stats", url: statsUrl, data } });
        }

        connectedAp = siteResponseData.result.connectedAp;
        activeUser = siteResponseData.result.activeUser;
        alerts = siteResponseData.result.alerts;
      } else if (controllerVersionMajor === 4 || controllerVersionMajor === 5) {
        const siteName = controllerVersionMajor === 5 ? site.id : site.key;
        const siteStatsUrl =
          controllerVersionMajor === 4
            ? `${url}/api/v2/sites/${siteName}/dashboard/overviewDiagram?token=${token}&currentPage=1&currentPageSize=1000`
            : `${url}/${cId}/api/v2/sites/${siteName}/dashboard/overviewDiagram?token=${token}&currentPage=1&currentPageSize=1000`;

        [status, contentType, data] = await httpProxy(siteStatsUrl, {
          headers: {
            "Csrf-Token": token,
          },
        });

        siteResponseData = JSON.parse(data);

        if (status !== 200 || siteResponseData.errorCode > 0) {
          logger.debug(`HTTP ${status} getting stats for site ${widget.site} with message ${siteResponseData.msg}`);
          return res.status(500).send(data);
        }

        const alertUrl =
          controllerVersionMajor === 4
            ? `${url}/api/v2/sites/${siteName}/alerts/num?token=${token}&currentPage=1&currentPageSize=1000`
            : `${url}/${cId}/api/v2/sites/${siteName}/alerts/num?token=${token}&currentPage=1&currentPageSize=1000`;

        // eslint-disable-next-line no-unused-vars
        [status, contentType, data] = await httpProxy(alertUrl, {
          headers: {
            "Csrf-Token": token,
          },
        });
        const alertResponseData = JSON.parse(data);

        activeUser = siteResponseData.result.totalClientNum;
        connectedAp = siteResponseData.result.connectedApNum;
        connectedGateways = siteResponseData.result.connectedGatewayNum;
        connectedSwitches = siteResponseData.result.connectedSwitchNum;
        alerts = alertResponseData.result.alertNum;
      }

      return res.send(
        JSON.stringify({
          connectedAp,
          activeUser,
          alerts,
          connectedGateways,
          connectedSwitches,
        }),
      );
    }
  }

  return res.status(400).json({ error: "Invalid proxy service type" });
}
