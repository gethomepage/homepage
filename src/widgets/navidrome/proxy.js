import { createHash, randomBytes } from "node:crypto";

import cache from "memory-cache";

import getServiceWidget from "utils/config/service-helpers";
import createLogger from "utils/logger";
import { sanitizeErrorURL } from "utils/proxy/api-helpers";
import { httpProxy } from "utils/proxy/http";
import validateWidgetData from "utils/proxy/validate-widget-data";

const proxyName = "navidromeProxyHandler";
const sessionCacheKey = `${proxyName}__session`;
const logger = createLogger(proxyName);

function getWidgetUser(widget) {
  return widget.user?.toString() ?? widget.username?.toString() ?? "";
}

function getCacheKey(group, service, index) {
  return `${sessionCacheKey}.${group}.${service}.${index ?? "0"}`;
}

function parseResponseData(data) {
  if (!Buffer.isBuffer(data)) {
    return data;
  }

  const text = data.toString();
  try {
    return JSON.parse(text);
  } catch (_error) {
    return text;
  }
}

function createErrorResponse(message, status = 400) {
  return [status, "application/json", { error: { message } }];
}

function getLibraryHeaders(sessionToken) {
  return {
    Accept: "application/json",
    "X-ND-Authorization": `Bearer ${sessionToken}`,
  };
}

function getTokenTtl(sessionToken) {
  try {
    const payloadSegment = sessionToken.split(".")[1];
    if (!payloadSegment) {
      return 55 * 60 * 1000;
    }

    const base64 = payloadSegment.replace(/-/g, "+").replace(/_/g, "/");
    const normalized = `${base64}${"=".repeat((4 - (base64.length % 4)) % 4)}`;
    const payload = JSON.parse(Buffer.from(normalized, "base64").toString());

    if (typeof payload.exp !== "number") {
      return 55 * 60 * 1000;
    }

    return Math.max(payload.exp * 1000 - Date.now() - 5 * 60 * 1000, 60 * 1000);
  } catch (_error) {
    return 55 * 60 * 1000;
  }
}

async function login(widget, cacheKey) {
  const user = getWidgetUser(widget);
  if (!user || !widget.password) {
    return createErrorResponse("Navidrome library stats require widget.user or widget.username and widget.password.");
  }

  const loginUrl = new URL(`${widget.url.replace(/\/+$/, "")}/auth/login`);
  const headers = {
    Accept: "application/json",
    "Content-Type": "application/json",
  };
  const body = JSON.stringify({
    username: user,
    password: widget.password.toString(),
  });

  const [status, contentType, data] = await httpProxy(loginUrl, {
    method: "POST",
    headers,
    body,
  });

  const parsedData = parseResponseData(data);
  if (status !== 200) {
    return [status, contentType, parsedData];
  }

  if (!parsedData?.token) {
    logger.error("Invalid Navidrome login response: %s", JSON.stringify(parsedData));
    return createErrorResponse("Invalid data received from Navidrome auth/login.", 500);
  }

  cache.put(cacheKey, parsedData.token, getTokenTtl(parsedData.token));
  return [status, contentType, parsedData];
}

function buildSubsonicToken(widget) {
  if (widget.token && widget.salt) {
    return {
      token: widget.token.toString(),
      salt: widget.salt.toString(),
    };
  }

  if (!widget.password) {
    return null;
  }

  const salt = randomBytes(4).toString("hex");
  const token = createHash("md5").update(`${widget.password.toString()}${salt}`).digest("hex");

  return { token, salt };
}

async function proxyNowPlaying(widget) {
  const user = getWidgetUser(widget);
  if (!user) {
    return createErrorResponse("Navidrome now playing requires widget.user or widget.username.");
  }

  const credentials = buildSubsonicToken(widget);
  if (!credentials) {
    return createErrorResponse("Navidrome now playing requires widget.token/widget.salt or widget.password.");
  }

  const url = new URL(`${widget.url.replace(/\/+$/, "")}/rest/getNowPlaying`);
  url.searchParams.set("u", user);
  url.searchParams.set("t", credentials.token);
  url.searchParams.set("s", credentials.salt);
  url.searchParams.set("v", "1.16.1");
  url.searchParams.set("c", "homepage");
  url.searchParams.set("f", "json");

  return httpProxy(url, {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
  });
}

function aggregateLibraryData(libraries) {
  return libraries.reduce(
    (totals, library) => ({
      totalSongs: totals.totalSongs + (library.totalSongs ?? 0),
      totalAlbums: totals.totalAlbums + (library.totalAlbums ?? 0),
      totalArtists: totals.totalArtists + (library.totalArtists ?? 0),
    }),
    { totalSongs: 0, totalAlbums: 0, totalArtists: 0 },
  );
}

async function proxyLibrary(widget, cacheKey) {
  let sessionToken = cache.get(cacheKey);
  if (!sessionToken) {
    const [loginStatus, loginContentType, loginData] = await login(widget, cacheKey);
    if (loginStatus !== 200) {
      return [loginStatus, loginContentType ?? "application/json", loginData];
    }
    sessionToken = loginData.token;
  }

  const libraryUrl = new URL(`${widget.url.replace(/\/+$/, "")}/api/library`);
  let [status, contentType, data] = await httpProxy(libraryUrl, {
    method: "GET",
    headers: getLibraryHeaders(sessionToken),
  });

  if (status === 401 || status === 403) {
    const [loginStatus, loginContentType, loginData] = await login(widget, cacheKey);
    if (loginStatus !== 200) {
      return [loginStatus, loginContentType ?? "application/json", loginData];
    }

    [status, contentType, data] = await httpProxy(libraryUrl, {
      method: "GET",
      headers: getLibraryHeaders(loginData.token),
    });
  }

  if (status !== 200) {
    return [status, contentType, parseResponseData(data)];
  }

  const parsedData = parseResponseData(data);
  if (!Array.isArray(parsedData)) {
    logger.error("Invalid Navidrome library response: %s", JSON.stringify(parsedData));
    return createErrorResponse("Invalid data received from Navidrome api/library.", 500);
  }

  return [status, contentType, aggregateLibraryData(parsedData)];
}

export default async function navidromeProxyHandler(req, res) {
  const { group, service, endpoint, index } = req.query;

  if (!group || !service) {
    logger.debug("Invalid or missing service '%s' or group '%s'", service, group);
    return res.status(400).json({ error: "Invalid proxy service type" });
  }

  const widget = await getServiceWidget(group, service, index);

  if (!widget) {
    logger.debug("Invalid or missing widget for service '%s' in group '%s'", service, group);
    return res.status(400).json({ error: "Invalid proxy service type" });
  }

  const cacheKey = getCacheKey(group, service, index);

  let response;
  switch (endpoint) {
    case "getNowPlaying":
      response = await proxyNowPlaying(widget);
      break;
    case "Library":
      response = await proxyLibrary(widget, cacheKey);
      break;
    default:
      response = createErrorResponse(`Unsupported Navidrome endpoint '${endpoint}'.`);
      break;
  }

  const [status, contentType, data] = response;
  let resultData = parseResponseData(data);

  if (resultData?.error?.url) {
    resultData.error.url = sanitizeErrorURL(resultData.error.url);
  }

  if (status === 200 && !validateWidgetData(widget, endpoint, resultData)) {
    return res.status(500).json({ error: { message: "Invalid data", data: resultData } });
  }

  if (contentType) {
    res.setHeader("Content-Type", contentType);
  }

  if (status === 204 || status === 304) {
    return res.status(status).end();
  }

  return res.status(status).send(resultData);
}
