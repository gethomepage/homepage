import cache from "memory-cache";

import getServiceWidget from "utils/config/service-helpers";
import createLogger from "utils/logger";
import { formatApiCall } from "utils/proxy/api-helpers";
import { httpProxy } from "utils/proxy/http";
import widgets from "widgets/widgets";

const proxyName = "bookorbitProxyHandler";
const sessionTokenCacheKey = `${proxyName}__sessionToken`;
const logger = createLogger(proxyName);

async function login(widget, service) {
  if (!widget.username || !widget.password) {
    logger.debug("Missing credentials for BookOrbit service '%s'", service);
    return { accessToken: false };
  }

  const api = widgets?.[widget.type]?.api;
  const loginUrl = new URL(formatApiCall(api, { ...widget, endpoint: "auth/login" }));

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
    logger.debug("BookOrbit login failed for service '%s' with status %d", service, status);
    return { accessToken: false };
  }

  try {
    const parsedData = JSON.parse(data.toString());
    const accessToken = parsedData?.accessToken;

    if (accessToken) {
      cache.put(`${sessionTokenCacheKey}.${service}`, accessToken, 10 * 60 * 60 * 1000 - 60 * 1000);
      return { accessToken };
    }
  } catch (e) {
    logger.error("Unable to login to BookOrbit API: %s", e);
  }

  return { accessToken: false };
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
    Authorization: `Bearer ${accessToken}`,
  };

  const url = new URL(formatApiCall(widgets[widget.type].api, { ...widget, endpoint }));
  let [status, , data] = await httpProxy(url, {
    method: "GET",
    headers,
  });

  if (status === 401 || status === 403) {
    logger.debug("BookOrbit API rejected the request, attempting to obtain a new session token");
    const refreshedToken = (await login(widget, service)).accessToken;
    if (!refreshedToken) {
      return { status, data: null };
    }
    headers.Authorization = `Bearer ${refreshedToken}`;
    [status, , data] = await httpProxy(url, {
      method: "GET",
      headers,
    });
  }

  if (status !== 200) {
    logger.error("Error getting data from BookOrbit: %s status %d. Data: %s", url, status, data);
    return { status, data: null };
  }

  try {
    return { status, data: JSON.parse(data.toString()) };
  } catch (e) {
    logger.error("Error parsing BookOrbit response: %s", e);
  }

  return { status, data: null };
}

export default async function bookorbitProxyHandler(req, res) {
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
    logger.debug("Missing credentials for BookOrbit widget in service '%s'", service);
    return res.status(400).json({ error: "Missing Bookorbit credentials" });
  }

  const { data: librariesData, status: librariesStatus } = await apiCall(widget, "libraries", service);

  if (librariesStatus !== 200 || !Array.isArray(librariesData)) {
    return res.status(librariesStatus || 500).send(librariesData || { error: "Error fetching libraries" });
  }

  const { data: summaryData, status: summaryStatus } = await apiCall(widget, "user-statistics/summary", service);

  if (summaryStatus !== 200 || !summaryData || typeof summaryData !== "object") {
    return res.status(summaryStatus || 500).send(summaryData || { error: "Error fetching user statistics" });
  }

  return res.status(200).send({
    libraries: librariesData.length,
    books: Number(summaryData.trackedBooks ?? 0),
    reading: Number(summaryData.startedBooks ?? summaryData.inProgressBooks ?? 0),
    finished: Number(summaryData.completedBooks ?? 0),
  });
}
