import cache from 'memory-cache';

import getServiceWidget from 'utils/config/service-helpers';
import { formatApiCall } from 'utils/proxy/api-helpers';
import widgets from 'widgets/widgets';
import createLogger from 'utils/logger';
import { httpProxy } from 'utils/proxy/http';

const proxyName = 'pyloadProxyHandler';
const logger = createLogger(proxyName);
const sessionCacheKey = `${proxyName}__sessionId`;

async function fetchFromPyloadAPI(url, sessionId, params) {
  const options = {
    body: params
      ? Object.keys(params)
          .map((prop) => `${prop}=${params[prop]}`)
          .join('&')
      : `session=${sessionId}`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  };

  // eslint-disable-next-line no-unused-vars
  const [status, contentType, data] = await httpProxy(url, options);
  return [status, JSON.parse(Buffer.from(data).toString())];
}

async function login(loginUrl, username, password = '') {
  const [status, sessionId] = await fetchFromPyloadAPI(loginUrl, null, { username, password });
  if (status !== 200) {
    throw new Error(`HTTP error ${status} logging into Pyload API, returned: ${sessionId}`);
  } else {
    cache.put(sessionCacheKey, sessionId);
    return sessionId;
  }
}

export default async function pyloadProxyHandler(req, res) {
  const { group, service, endpoint } = req.query;

  try {
    if (group && service) {
      const widget = await getServiceWidget(group, service);

      if (widget) {
        const url = new URL(formatApiCall(widgets[widget.type].api, { endpoint, ...widget }));
        const loginUrl = `${widget.url}/api/login`;

        let sessionId = cache.get(sessionCacheKey) ?? await login(loginUrl, widget.username, widget.password);
        let [status, data] = await fetchFromPyloadAPI(url, sessionId);

        if (status === 403) {
          logger.debug('Failed to retrieve data from Pyload API, login and re-try');
          cache.del(sessionCacheKey);
          sessionId = await login(loginUrl, widget.username, widget.password);
          [status, data] = await fetchFromPyloadAPI(url, sessionId);
        }

        if (data?.error || status !== 200) {
          return res.status(500).send(Buffer.from(data).toString());
        }

        return res.json(data);
      }
    }
  } catch (e) {
    logger.error(e);
    return res.status(500).send(e.toString());
  }

  return res.status(400).json({ error: 'Invalid proxy service type' });
}
