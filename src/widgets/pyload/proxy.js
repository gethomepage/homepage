import cache from "memory-cache";

import getServiceWidget from "utils/config/service-helpers";
import { formatApiCall } from "utils/proxy/api-helpers";
import widgets from "widgets/widgets";
import createLogger from "utils/logger";
import { httpProxy } from "utils/proxy/http";

const proxyName = "pyloadProxyHandler";
const logger = createLogger(proxyName);
const sessionCacheKey = `${proxyName}__sessionId`;
const isNgCacheKey = `${proxyName}__isNg`;

async function fetchFromPyloadAPI(url, sessionId, params, service) {
  const options = {
    body: params
      ? Object.keys(params)
          .map((prop) => `${prop}=${params[prop]}`)
          .join("&")
      : `session=${sessionId}`,
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
  };

  // see https://github.com/gethomepage/homepage/issues/517
  const isNg = cache.get(`${isNgCacheKey}.${service}`);
  if (isNg && !params) {
    delete options.body;
    options.headers.Cookie = cache.get(`${sessionCacheKey}.${service}`);
  }

  // eslint-disable-next-line no-unused-vars
  const [status, contentType, data, responseHeaders] = await httpProxy(url, options);
  let returnData;
  try {
    returnData = JSON.parse(Buffer.from(data).toString());
  } catch (e) {
    logger.error(`Error logging into pyload API: ${JSON.stringify(data)}`);
    returnData = data;
  }
  return [status, returnData, responseHeaders];
}

async function login(loginUrl, service, username, password = "") {
  const [status, sessionId, responseHeaders] = await fetchFromPyloadAPI(
    loginUrl,
    null,
    { username, password },
    service,
  );

  // this API actually returns status 200 even on login failure
  if (status !== 200 || sessionId === false) {
    logger.error(`HTTP ${status} logging into Pyload API, returned: ${JSON.stringify(sessionId)}`);
  } else if (responseHeaders["set-cookie"]?.join().includes("pyload_session")) {
    // Support pyload-ng, see https://github.com/gethomepage/homepage/issues/517
    cache.put(`${isNgCacheKey}.${service}`, true);
    const sessionCookie = responseHeaders["set-cookie"][0];
    cache.put(`${sessionCacheKey}.${service}`, sessionCookie, 60 * 60 * 23 * 1000); // cache for 23h
  } else {
    cache.put(`${sessionCacheKey}.${service}`, sessionId);
  }

  return sessionId;
}

export default async function pyloadProxyHandler(req, res) {
  const { group, service, endpoint } = req.query;

  try {
    if (group && service) {
      const widget = await getServiceWidget(group, service);

      if (widget) {
        const url = new URL(formatApiCall(widgets[widget.type].api, { endpoint, ...widget }));
        const loginUrl = `${widget.url}/api/login`;

        let sessionId =
          cache.get(`${sessionCacheKey}.${service}`) ??
          (await login(loginUrl, service, widget.username, widget.password));
        let [status, data] = await fetchFromPyloadAPI(url, sessionId, null, service);

        if (status === 403 || status === 401) {
          logger.info("Failed to retrieve data from Pyload API, trying to login again...");
          cache.del(`${sessionCacheKey}.${service}`);
          sessionId = await login(loginUrl, service, widget.username, widget.password);
          [status, data] = await fetchFromPyloadAPI(url, sessionId, null, service);
        }

        if (data?.error || status !== 200) {
          try {
            return res.status(status).send({
              error: { message: "HTTP error communicating with Pyload API", data: Buffer.from(data).toString() },
            });
          } catch (e) {
            return res.status(status).send({ error: { message: "HTTP error communicating with Pyload API", data } });
          }
        }

        return res.json(data);
      }
    }
  } catch (e) {
    if (e) logger.error(e);
    return res.status(500).send({ error: { message: `Error communicating with Pyload API: ${e.toString()}` } });
  }

  return res.status(400).json({ error: "Invalid proxy service type" });
}
