import cache from "memory-cache";

import getServiceWidget from "utils/config/service-helpers";
import createLogger from "utils/logger";
import { formatApiCall } from "utils/proxy/api-helpers";
import { httpProxy } from "utils/proxy/http";
import widgets from "widgets/widgets";

const proxyName = "shelfmarkProxyHandler";
const sessionTokenCacheKey = `${proxyName}__sessionToken`;
const logger = createLogger(proxyName);
const allowedStatusKeys = new Set([
  "requested",
  "available",
  "downloading",
  "complete",
  "error",
  "cancelled",
  "done",
  "locating",
  "queued",
  "resolving",
]);

function extractAccessToken(payload) {
  if (!payload || typeof payload !== "object") return null;

  return payload.accessToken ?? payload.access_token ?? payload.token ?? payload.jwt ?? payload.id_token ?? null;
}

async function login(widget, service) {
  if (!widget.username || !widget.password) {
    logger.debug("Missing credentials for Shelfmark service '%s'", service);
    return { accessToken: false };
  }

  const loginURL = widgets?.[widget.type]?.loginURL;
  const loginUrl = new URL(formatApiCall(loginURL, widget));

  const [status, , data] = await httpProxy(loginUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      accept: "application/json",
    },
    body: JSON.stringify({
      username: widget.username,
      password: widget.password,
    }),
  });

  if (status !== 200) {
    logger.debug("Shelfmark login failed for service '%s' with status %d", service, status);
    return { accessToken: false };
  }

  try {
    const accessToken = extractAccessToken(JSON.parse(data.toString()));

    if (accessToken) {
      cache.put(`${sessionTokenCacheKey}.${service}`, accessToken, 60 * 60 * 1000 - 60 * 1000);
      return { accessToken };
    }
  } catch (e) {
    logger.error("Unable to parse Shelfmark login response: %s", e);
  }

  // Some backends rely purely on session cookies from login.
  return { accessToken: true };
}

async function apiCall(widget, endpoint, service) {
  const cacheKey = `${sessionTokenCacheKey}.${service}`;
  let accessToken = cache.get(cacheKey);

  if (!accessToken) {
    ({ accessToken } = await login(widget, service));
  }

  if (!accessToken) {
    return { status: 401, data: null };
  }

  const headers = {
    accept: "application/json",
  };

  if (typeof accessToken === "string") {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  const url = new URL(formatApiCall(widgets[widget.type].api, { ...widget, endpoint }));
  let [status, , data] = await httpProxy(url, {
    method: "GET",
    headers,
  });

  if (status === 401 || status === 403) {
    logger.debug("Shelfmark API rejected the request, attempting to obtain a new session token");
    const refreshedToken = (await login(widget, service)).accessToken;
    if (!refreshedToken) {
      return { status, data: null };
    }

    if (typeof refreshedToken === "string") {
      headers.Authorization = `Bearer ${refreshedToken}`;
    } else {
      delete headers.Authorization;
    }

    [status, , data] = await httpProxy(url, {
      method: "GET",
      headers,
    });
  }

  if (status !== 200) {
    logger.error("Error getting data from Shelfmark: %s status %d. Data: %s", url, status, data);
    return { status, data: null };
  }

  try {
    return { status, data: JSON.parse(data.toString()) };
  } catch (e) {
    logger.error("Error parsing Shelfmark response: %s", e);
  }

  return { status, data: null };
}

function summarizeStatusEntries(payload) {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return {};
  }

  return Object.fromEntries(
    Object.entries(payload)
      .filter(([key, value]) => allowedStatusKeys.has(key) && value && typeof value === "object")
      .map(([key, value]) => {
        if (Array.isArray(value)) {
          return [key, value.length];
        }
        return [key, Object.keys(value).length];
      }),
  );
}

export default async function shelfmarkProxyHandler(req, res) {
  const { group, service, index } = req.query;

  if (!group || !service) {
    logger.debug("Invalid or missing service '%s' or group '%s'", service, group);
    return res.status(400).json({ error: "Invalid proxy service type" });
  }

  const widget = await getServiceWidget(group, service, index);

  if (!widget) {
    logger.debug("Invalid or missing widget for service '%s' in group '%s'", service, group);
    return res.status(400).json({ error: "Invalid proxy service type" });
  }

  if (!widget.username || !widget.password) {
    logger.debug("Missing credentials for Shelfmark widget in service '%s'", service);
    return res.status(400).json({ error: "Missing Shelfmark credentials" });
  }

  if (!widget.url) {
    logger.debug("Missing URL for Shelfmark widget in service '%s'", service);
    return res.status(400).json({ error: "Missing Shelfmark URL" });
  }

  const { data, status } = await apiCall(widget, "status", service);

  if (status !== 200 || !data || typeof data !== "object") {
    return res.status(status || 500).send(data || { error: "Error fetching status" });
  }

  return res.status(200).send({
    statuses: summarizeStatusEntries(data),
  });
}
