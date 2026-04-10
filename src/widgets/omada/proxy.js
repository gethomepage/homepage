import cache from "memory-cache";

import getServiceWidget from "utils/config/service-helpers";
import createLogger from "utils/logger";
import { httpProxy } from "utils/proxy/http";

const proxyName = "omadaProxyHandler";
const sessionCacheKey = `${proxyName}__session`;

const logger = createLogger(proxyName);

function getSessionCacheId(group, service, index) {
  return [sessionCacheKey, group, service, index ?? "0"].join(".");
}

function shouldRetryWithFreshSession(status, responseData, attempt, usedCachedSession) {
  return attempt === 0 && usedCachedSession && (status === 401 || status === 403 || responseData?.errorCode > 0);
}

function getCookieHeader(responseHeaders) {
  const setCookie = responseHeaders?.["set-cookie"];
  if (!setCookie) return null;

  const cookies = new Map();
  (Array.isArray(setCookie) ? setCookie : [setCookie]).forEach((cookie) => {
    const cookiePair = cookie.split(";")[0];
    if (!cookiePair) return;

    const separatorIndex = cookiePair.indexOf("=");
    const cookieName = separatorIndex === -1 ? cookiePair : cookiePair.slice(0, separatorIndex);
    cookies.set(cookieName, cookiePair);
  });

  return cookies.size > 0 ? Array.from(cookies.values()).join("; ") : null;
}

async function login(loginUrl, username, password, controllerVersionMajor, sessionCacheId) {
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
    body: JSON.stringify(params),
    headers: {
      "Content-Type": "application/json",
    },
  });

  const loginResponseData = JSON.parse(data.toString());

  if (status === 200 && loginResponseData.errorCode === 0) {
    cache.put(
      sessionCacheId,
      {
        token: loginResponseData.result.token,
        cookieHeader: getCookieHeader(responseHeaders),
      },
      55 * 60 * 1000, // Cache session for 55 minutes
    );
  }

  return [status, loginResponseData];
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

      const sessionCacheId = getSessionCacheId(group, service, index);
      let session = cache.get(sessionCacheId);

      for (let attempt = 0; attempt < 2; attempt += 1) {
        try {
          const usedCachedSession = Boolean(session);

          if (!session) {
            const [loginStatus, loginResponseData] = await login(
              loginUrl,
              widget.username,
              widget.password,
              controllerVersionMajor,
              sessionCacheId,
            );

            if (loginStatus !== 200 || loginResponseData.errorCode > 0) {
              return res.status(loginStatus).json({
                error: { message: "Error logging in to Omada controller", url: loginUrl, data: loginResponseData },
              });
            }

            session = cache.get(sessionCacheId);
          }

          const { token, cookieHeader } = session;

          let sitesUrl;
          let body = {};
          let params = { token };
          let headers = { "Csrf-Token": token };
          if (cookieHeader) {
            headers.Cookie = cookieHeader;
          }
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
              headers = { "Content-Type": "application/json" };
              if (cookieHeader) {
                headers.Cookie = cookieHeader;
              }
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
            headers: { ...headers },
          });

          const sitesResponseData = JSON.parse(data);

          if (status !== 200 || sitesResponseData.errorCode > 0) {
            logger.debug(`HTTP ${status} getting sites list: ${sitesResponseData.msg}`);
            if (shouldRetryWithFreshSession(status, sitesResponseData, attempt, usedCachedSession)) {
              cache.del(sessionCacheId);
              session = null;
              continue;
            }
            return res
              .status(status)
              .json({ error: { message: "Error getting sites list", url, data: sitesResponseData } });
          }

          const site =
            controllerVersionMajor === 3
              ? sitesResponseData.result.siteList.find((s) => s.name === widget.site)
              : sitesResponseData.result.data.find((s) => s.name === widget.site);

          if (!site) {
            return res
              .status(status)
              .json({ error: { message: `Site ${widget.site} is not found`, url: sitesUrl, data } });
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
            if (cookieHeader) {
              headers.Cookie = cookieHeader;
            }
            params = { token };

            [status, contentType, data] = await httpProxy(switchUrl, {
              method,
              params,
              body: JSON.stringify(body),
              headers: { ...headers },
            });

            const switchResponseData = JSON.parse(data);
            if (status !== 200 || switchResponseData.errorCode > 0) {
              logger.error(`HTTP ${status} getting sites list: ${data}`);
              if (shouldRetryWithFreshSession(status, switchResponseData, attempt, usedCachedSession)) {
                cache.del(sessionCacheId);
                session = null;
                continue;
              }
              return res.status(status).json({ error: { message: "Error switching site", url: switchUrl, data } });
            }

            const statsUrl = `${url}/web/v1/controller?getGlobalStat=&token=${token}`;
            [status, contentType, data] = await httpProxy(statsUrl, {
              method,
              params,
              body: JSON.stringify({
                method: "getGlobalStat",
              }),
              headers: { ...headers },
            });

            siteResponseData = JSON.parse(data);

            if (status !== 200 || siteResponseData.errorCode > 0) {
              if (shouldRetryWithFreshSession(status, siteResponseData, attempt, usedCachedSession)) {
                cache.del(sessionCacheId);
                session = null;
                continue;
              }
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
              headers: { ...headers },
            });

            siteResponseData = JSON.parse(data);

            if (status !== 200 || siteResponseData.errorCode > 0) {
              logger.debug(`HTTP ${status} getting stats for site ${widget.site} with message ${siteResponseData.msg}`);
              if (shouldRetryWithFreshSession(status, siteResponseData, attempt, usedCachedSession)) {
                cache.del(sessionCacheId);
                session = null;
                continue;
              }
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
              headers: { ...headers },
            });
            const alertResponseData = JSON.parse(data);

            if (status !== 200 || alertResponseData.errorCode > 0) {
              if (shouldRetryWithFreshSession(status, alertResponseData, attempt, usedCachedSession)) {
                cache.del(sessionCacheId);
                session = null;
                continue;
              }
              return res.status(status === 200 ? 500 : status).json({
                error: {
                  message: "Error getting alerts",
                  url: alertUrl,
                  data: alertResponseData,
                },
              });
            }

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
        } catch (error) {
          if (error instanceof SyntaxError && attempt === 0) {
            cache.del(sessionCacheId);
            session = null;
            continue;
          }

          throw error;
        }
      }
    }
  }

  return res.status(400).json({ error: "Invalid proxy service type" });
}
