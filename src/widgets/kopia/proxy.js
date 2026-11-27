import cache from "memory-cache";

import getServiceWidget from "utils/config/service-helpers";
import createLogger from "utils/logger";
import { formatApiCall } from "utils/proxy/api-helpers";
import { httpProxy } from "utils/proxy/http";
import widgets from "widgets/widgets";

const proxyName = "kopiaProxyHandler";
const sessionCacheKey = `${proxyName}__session`;
const logger = createLogger(proxyName);
const CSRF_TOKEN_HEADER = "X-Kopia-Csrf-Token";
const SESSION_COOKIE_NAME = "Kopia-Session-Cookie";
const CSRF_TOKEN_PATTERN = /<meta name="kopia-csrf-token" content="([^"]*)"\s*\/>/;

function basicAuthHeader(widget) {
  return `Basic ${Buffer.from(`${widget.username}:${widget.password}`).toString("base64")}`;
}

function widgetBaseUrl(widget) {
  return String(widget.url ?? "").replace(/\/+$/, "");
}

function sessionKey(service) {
  return `${sessionCacheKey}.${service}`;
}

function parseSessionCookie(headers) {
  const raw = headers?.["set-cookie"];
  const list = Array.isArray(raw) ? raw : raw ? [raw] : [];

  for (const entry of list) {
    const match = new RegExp(`^${SESSION_COOKIE_NAME}=([^;]+)`, "i").exec(entry);
    if (match) {
      return `${SESSION_COOKIE_NAME}=${match[1]}`;
    }
  }

  return null;
}

function parseCsrfToken(body) {
  const match = CSRF_TOKEN_PATTERN.exec(Buffer.isBuffer(body) ? body.toString() : String(body ?? ""));
  return match?.[1] || null;
}

async function fetchSession(widget) {
  const uiUrl = `${widgetBaseUrl(widget)}/`;
  const [status, , data, headers] = await httpProxy(uiUrl, {
    method: "GET",
    headers: {
      Authorization: basicAuthHeader(widget),
    },
  });

  if (status !== 200) {
    logger.debug(`HTTP ${status} fetching Kopia UI for CSRF handshake`);
    return [status, null, data];
  }

  const cookie = parseSessionCookie(headers);
  const csrfToken = parseCsrfToken(data);

  if (!cookie || !csrfToken) {
    logger.error("Kopia UI response did not include a session cookie and CSRF token");
    return [500, null, "Kopia UI response did not include a session cookie and CSRF token"];
  }

  return [200, { cookie, csrfToken }, data];
}

function apiHeaders(widget, session) {
  return {
    Authorization: basicAuthHeader(widget),
    Cookie: session.cookie,
    [CSRF_TOKEN_HEADER]: session.csrfToken,
  };
}

export default async function kopiaProxyHandler(req, res) {
  const { group, service, endpoint, index } = req.query;

  if (group && service) {
    const widget = await getServiceWidget(group, service, index);

    if (!widgets?.[widget.type]?.api) {
      return res.status(403).json({ error: "Service does not support API calls" });
    }

    if (widget) {
      const url = new URL(formatApiCall(widgets[widget.type].api, { endpoint, ...widget }));
      const cacheKey = sessionKey(service);
      let session = cache.get(cacheKey);

      if (!session) {
        const [handshakeStatus, nextSession, handshakeData] = await fetchSession(widget);
        if (handshakeStatus !== 200) {
          return res.status(handshakeStatus).send(handshakeData);
        }
        session = nextSession;
        cache.put(cacheKey, session);
      }

      let [status, contentType, data] = await httpProxy(url, {
        method: "GET",
        headers: apiHeaders(widget, session),
      });

      if (status === 401 || status === 403) {
        logger.debug(`HTTP ${status} retrieving data from Kopia, repeating CSRF handshake.`);
        cache.del(cacheKey);
        const [handshakeStatus, nextSession, handshakeData] = await fetchSession(widget);
        if (handshakeStatus !== 200) {
          return res.status(handshakeStatus).send(handshakeData);
        }
        session = nextSession;
        cache.put(cacheKey, session);

        [status, contentType, data] = await httpProxy(url, {
          method: "GET",
          headers: apiHeaders(widget, session),
        });
      }

      if (contentType) res.setHeader("Content-Type", contentType);

      if (status !== 200) {
        return res.status(status).send(data);
      }

      return res.send(data);
    }
  }

  return res.status(400).json({ error: "Invalid proxy service type" });
}
