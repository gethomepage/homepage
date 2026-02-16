import cache from "memory-cache";

import getServiceWidget from "utils/config/service-helpers";
import createLogger from "utils/logger";
import { formatApiCall } from "utils/proxy/api-helpers";
import { httpProxy } from "utils/proxy/http";
import widgets from "widgets/widgets";

const proxyName = "bookloreProxyHandler";
const sessionTokenCacheKey = `${proxyName}__sessionToken`;
const logger = createLogger(proxyName);

async function login(widget, service) {
  if (!widget.username || !widget.password) {
    logger.debug("Missing credentials for Booklore service '%s'", service);
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
    logger.debug("Booklore login failed for service '%s' with status %d", service, status);
    return { accessToken: false };
  }

  try {
    const { accessToken } = JSON.parse(data.toString());

    if (accessToken) {
      // access tokens are valid for ~10 hours; refresh 1 minute early.
      cache.put(`${sessionTokenCacheKey}.${service}`, accessToken, 10 * 60 * 60 * 1000 - 60 * 1000);
      return { accessToken };
    }
  } catch (e) {
    logger.error("Unable to login to Booklore API: %s", e);
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
    logger.debug("Booklore API rejected the request, attempting to obtain new session token");
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
    logger.error("Error getting data from Booklore: %s status %d. Data: %s", url, status, data);
    return { status, data: null };
  }

  try {
    return { status, data: JSON.parse(data.toString()) };
  } catch (e) {
    logger.error("Error parsing Booklore response: %s", e);
  }

  return { status, data: null };
}

function summarizeStatuses(books = []) {
  return books.reduce(
    (accumulator, book) => {
      const status = (book?.readStatus || "").toString().toUpperCase();
      if (status === "READING") accumulator.reading += 1;
      else if (status === "READ") accumulator.finished += 1;
      return accumulator;
    },
    { reading: 0, finished: 0 },
  );
}

export default async function bookloreProxyHandler(req, res) {
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
    logger.debug("Missing credentials for Booklore widget in service '%s'", service);
    return res.status(400).json({ error: "Missing Booklore credentials" });
  }

  const { data: librariesData, status: librariesStatus } = await apiCall(widget, "libraries", service);

  if (librariesStatus !== 200 || !Array.isArray(librariesData)) {
    return res.status(librariesStatus || 500).send(librariesData || { error: "Error fetching libraries" });
  }

  const { data: booksData, status: booksStatus } = await apiCall(widget, "books", service);

  if (booksStatus !== 200 || !Array.isArray(booksData)) {
    return res.status(booksStatus || 500).send(booksData || { error: "Error fetching books" });
  }

  const { reading, finished } = summarizeStatuses(booksData);

  return res.status(200).send({
    libraries: librariesData.length,
    books: booksData.length,
    reading,
    finished,
  });
}
