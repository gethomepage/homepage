import cache from "memory-cache";

import getServiceWidget from "utils/config/service-helpers";
import { formatApiCall } from "utils/proxy/api-helpers";
import widgets from "widgets/widgets";
import createLogger from "utils/logger";

const proxyName = 'pyloadProxyHandler';
const logger = createLogger(proxyName);
const sessionCacheKey = `${proxyName}__sessionId`;

async function fetchFromPyloadAPI(url, sessionId, params) {
  const options = {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
  };

  if (params) {
    options.body = Object.keys(params).map(k => `${k}=${params[k]}`).join('&');
  } else {
    options.body = `session=${sessionId}`
  }
  
  return fetch(url, options).then((response) => response.json());
}

async function login(loginUrl, username, password) {
  const sessionId = await fetchFromPyloadAPI(loginUrl, null, { username, password })
  cache.put(sessionCacheKey, sessionId);
  return sessionId;
}

export default async function pyloadProxyHandler(req, res) {
  const { group, service, endpoint } = req.query;

  if (group && service) {
    const widget = await getServiceWidget(group, service);

    if (widget) {
      const url = new URL(formatApiCall(widgets[widget.type].api, { endpoint, ...widget }));
      const loginUrl = `${widget.url}/api/login`;

      let sessionId = cache.get(sessionCacheKey);

      if (!sessionId) {
        sessionId = await login(loginUrl, widget.username, widget.password);
      }

      let apiResponse = await fetchFromPyloadAPI(url, sessionId);

      if (apiResponse?.error === 'Forbidden') {
        logger.debug("Failed to retrieve data from Pyload API, login and re-try");
        cache.del(sessionCacheKey);
        sessionId = await login(loginUrl, widget.username, widget.password);
        apiResponse = await fetchFromPyloadAPI(url, sessionId);
      }
      
      if (apiResponse?.error) {
        return res.status(500).send(apiResponse);
      }
      cache.del(sessionCacheKey);
      
      return res.send(apiResponse);
    }
  }

  return res.status(400).json({ error: "Invalid proxy service type" });
}