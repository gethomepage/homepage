import getServiceWidget from "utils/config/service-helpers";
import createLogger from "utils/logger";
import { httpProxy } from "utils/proxy/http";

const proxyName = "omadaProxyHandler";

const logger = createLogger(proxyName);

function parseOmadaJson(data, { step, status, contentType, url }) {
  const body = Buffer.isBuffer(data) ? data.toString() : String(data ?? "");

  try {
    return JSON.parse(body);
  } catch (error) {
    logger.debug(
      "Failed parsing Omada %s response as JSON (HTTP %d, content-type: %s, url: %s). Body: %s",
      step,
      status,
      contentType ?? "unknown",
      url,
      body,
    );
    throw error;
  }
}

function isLikelyHtmlResponse(contentType, data) {
  const body = Buffer.isBuffer(data) ? data.toString() : String(data ?? "");
  return contentType?.includes("text/html") || body.startsWith("<!DOCTYPE") || body.startsWith("<html");
}

function extractCookieHeader(responseHeaders) {
  const setCookieHeader = responseHeaders?.["set-cookie"];
  if (!setCookieHeader) return undefined;

  if (Array.isArray(setCookieHeader)) {
    return setCookieHeader.map((cookie) => cookie.split(";")[0]).join("; ");
  }

  return String(setCookieHeader).split(";")[0];
}

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

  const [status, contentType, data, responseHeaders] = await httpProxy(loginUrl, {
    method: "POST",
    cookieHeader: "X-Bypass-Cookie",
    body: JSON.stringify(params),
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
  });

  return [status, contentType, data, extractCookieHeader(responseHeaders)];
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

      if (![3, 4, 5, 6].includes(controllerVersionMajor)) {
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
        case 6:
          loginUrl = `${url}/${cId}/api/v2/login`;
          break;
        default:
          break;
      }

      const [loginStatus, loginContentType, loginData, loginCookieHeader] = await login(
        loginUrl,
        widget.username,
        widget.password,
        controllerVersionMajor,
      );
      const loginResponseData = parseOmadaJson(loginData, {
        step: "login",
        status: loginStatus,
        contentType: loginContentType,
        url: loginUrl,
      });

      if (loginStatus !== 200 || loginResponseData.errorCode > 0) {
        return res
          .status(loginStatus)
          .json({ error: { message: "Error logging in to Omada controller", url: loginUrl, data: loginResponseData } });
      }

      const { token } = loginResponseData.result;
      let omadaCookieHeader = loginCookieHeader;

      let sitesUrl;
      let body = {};
      let params = { token };
      let headers = { "Csrf-Token": token };
      if (omadaCookieHeader) headers.Cookie = omadaCookieHeader;
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
        case 6:
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
        cookieHeader: "X-Bypass-Cookie",
      });

      let sitesResponseData;
      try {
        sitesResponseData = parseOmadaJson(data, {
          step: "sites list",
          status,
          contentType,
          url: sitesUrl,
        });
      } catch (parseError) {
        if (!isLikelyHtmlResponse(contentType, data)) {
          throw parseError;
        }

        logger.debug("Received HTML response for Omada sites list; retrying with a fresh login.");

        const [retryLoginStatus, retryLoginContentType, retryLoginData, retryLoginCookieHeader] = await login(
          loginUrl,
          widget.username,
          widget.password,
          controllerVersionMajor,
        );
        const retryLoginResponseData = parseOmadaJson(retryLoginData, {
          step: "login (retry)",
          status: retryLoginStatus,
          contentType: retryLoginContentType,
          url: loginUrl,
        });

        if (retryLoginStatus !== 200 || retryLoginResponseData.errorCode > 0) {
          return res.status(retryLoginStatus).json({
            error: {
              message: "Error re-authenticating to Omada controller",
              url: loginUrl,
              data: retryLoginResponseData,
            },
          });
        }

        const retryToken = retryLoginResponseData.result?.token;
        omadaCookieHeader = retryLoginCookieHeader;
        const retrySitesUrlObj = new URL(sitesUrl);
        retrySitesUrlObj.searchParams.set("token", retryToken);
        const retrySitesUrl = retrySitesUrlObj.toString();

        [status, contentType, data] = await httpProxy(retrySitesUrl, {
          method,
          params: { token: retryToken },
          body: JSON.stringify(body),
          headers: {
            ...headers,
            "Csrf-Token": retryToken,
            ...(omadaCookieHeader ? { Cookie: omadaCookieHeader } : {}),
          },
          cookieHeader: "X-Bypass-Cookie",
        });

        sitesResponseData = parseOmadaJson(data, {
          step: "sites list (retry)",
          status,
          contentType,
          url: retrySitesUrl,
        });
      }

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
        if (omadaCookieHeader) headers.Cookie = omadaCookieHeader;
        params = { token };

        [status, contentType, data] = await httpProxy(switchUrl, {
          method,
          params,
          body: JSON.stringify(body),
          headers,
          cookieHeader: "X-Bypass-Cookie",
        });

        const switchResponseData = parseOmadaJson(data, {
          step: "switch site",
          status,
          contentType,
          url: switchUrl,
        });
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
          cookieHeader: "X-Bypass-Cookie",
        });

        siteResponseData = parseOmadaJson(data, {
          step: "global stats",
          status,
          contentType,
          url: statsUrl,
        });

        if (status !== 200 || siteResponseData.errorCode > 0) {
          return res.status(status).json({ error: { message: "Error getting stats", url: statsUrl, data } });
        }

        connectedAp = siteResponseData.result.connectedAp;
        activeUser = siteResponseData.result.activeUser;
        alerts = siteResponseData.result.alerts;
      } else if ([4, 5, 6].includes(controllerVersionMajor)) {
        const siteName = controllerVersionMajor > 4 ? site.id : site.key;
        const siteStatsUrl =
          controllerVersionMajor === 4
            ? `${url}/api/v2/sites/${siteName}/dashboard/overviewDiagram?token=${token}&currentPage=1&currentPageSize=1000`
            : `${url}/${cId}/api/v2/sites/${siteName}/dashboard/overviewDiagram?token=${token}&currentPage=1&currentPageSize=1000`;

        [status, contentType, data] = await httpProxy(siteStatsUrl, {
          headers: {
            "Csrf-Token": token,
            ...(omadaCookieHeader ? { Cookie: omadaCookieHeader } : {}),
          },
          cookieHeader: "X-Bypass-Cookie",
        });

        siteResponseData = parseOmadaJson(data, {
          step: "overview stats",
          status,
          contentType,
          url: siteStatsUrl,
        });

        if (status !== 200 || siteResponseData.errorCode > 0) {
          logger.debug(`HTTP ${status} getting stats for site ${widget.site} with message ${siteResponseData.msg}`);
          return res.status(status === 200 ? 500 : status).json({
            error: {
              message: "Error getting stats",
              url: siteStatsUrl,
              data: siteResponseData,
            },
          });
        }

        const alertUrl =
          controllerVersionMajor === 4
            ? `${url}/api/v2/sites/${siteName}/alerts/num?token=${token}&currentPage=1&currentPageSize=1000`
            : `${url}/${cId}/api/v2/sites/${siteName}/alerts/num?token=${token}&currentPage=1&currentPageSize=1000`;

        [status, contentType, data] = await httpProxy(alertUrl, {
          headers: {
            "Csrf-Token": token,
            ...(omadaCookieHeader ? { Cookie: omadaCookieHeader } : {}),
          },
          cookieHeader: "X-Bypass-Cookie",
        });
        const alertResponseData = parseOmadaJson(data, {
          step: "alerts",
          status,
          contentType,
          url: alertUrl,
        });

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
