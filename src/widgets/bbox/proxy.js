import cache from "memory-cache";

import getServiceWidget from "utils/config/service-helpers";
import createLogger from "utils/logger";
import { formatApiCall } from "utils/proxy/api-helpers";
import { addCookieToJar, setCookieHeader } from "utils/proxy/cookie-jar";
import { httpProxy } from "utils/proxy/http";
import widgets from "widgets/widgets";

const proxyName = "bboxProxyHandler";
const sessionTokenCacheKey = `${proxyName}__sessionToken`;
const logger = createLogger(proxyName);

async function fetchBboxCookie(widget) {
  const endpoint = "login";
  const api = widgets?.[widget.type]?.api;
  const url = new URL(formatApiCall(api, { endpoint, ...widget }));
  const loginData = `password=${encodeURIComponent(widget.password)}`;
  const [status, , , responseHeaders, params] = await httpProxy(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: loginData,
  });

  addCookieToJar(url, responseHeaders);
  setCookieHeader(url, params);

  if (!(status === 200) || !params?.headers?.Cookie) {
    logger.error("Failed to fetch Bbox cookie, status: %d", status);
    return null;
  }
  return params.headers.Cookie;
}

async function getToken(widget, service) {
  const endpoint = "devive/token";
  const api = widgets?.[widget.type]?.api;
  const url = new URL(formatApiCall(api, { endpoint, ...widget }));
  const headers = { "Content-Type": "application/json" };
  // eslint-disable-next-line no-unused-vars
  const [status, contentType, data, responseHeaders] = await httpProxy(url, {
    method: "GET",
    headers,
  });

  try {
    const { access_token: token, expires_in: expires } = JSON.parse(data[0].device.toString());
    logger.info(JSON.parse(data.toString()));

    cache.put(`${sessionTokenCacheKey}.${service}`, token, expires * 1000 - 5 * 60 * 1000); // expiresIn (s) - 5m
    return { token };
  } catch (e) {
    logger.error("Unable to login to Bbox API: %s", e);
  }

  return { token: false };
}

async function apiCall(widget, endpoint, service) {
  const key = `${sessionTokenCacheKey}.${service}`;
  const headers = {
    "content-type": "application/json",
    BBOX_ID: `${cache.get(key)}`,
  };

  const api = widgets?.[widget.type]?.api;
  const url = new URL(formatApiCall(api, { endpoint, ...widget }));
  const method = "GET";

  let [status, contentType, data, responseHeaders] = await httpProxy(url, {
    method,
    headers,
  });

  if (status === 401 || status === 403) {
    logger.debug("Bbox API rejected the request, attempting to obtain new session token");
    const { accessToken } = await getToken(widget, service);
    headers.Authorization = `Bearer ${accessToken}`;

    // retry the request, now with the new session token
    [status, contentType, data, responseHeaders] = await httpProxy(url, {
      method,
      headers,
    });
  }

  if (status !== 200) {
    logger.error("Error getting data from Bbox: %s status %d. Data: %s", url, status, JSON.stringify(data));
    return { status, contentType, data: [], responseHeaders };
  }

  return { status, contentType, data: JSON.parse(data.toString()), responseHeaders };
}

export default async function bboxProxyHandler(req, res) {
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

  if (widget.password) {
    const bboxCookie = await fetchBboxCookie(widget);
    if (!bboxCookie) {
      return res.status(500).json({ error: "Failed to authenticate with BBox" });
    }
    // Add the cookie to the widget for use in subsequent requests
    widget.headers = { ...widget.headers, Cookie: bboxCookie };
  }

  const { data: deviceData } = await apiCall(widget, "device", service);
  const { data: wanData } = await apiCall(widget, "wan/ip", service);
  const { data: hostData } = await apiCall(widget, "hosts", service);

  return res.status(200).send({
    status: wanData[0]?.wan?.link?.state,
    modelname: deviceData[0]?.device?.modelname,
    uptime: deviceData[0]?.device?.uptime,
    wanIPAddress: wanData[0]?.wan?.ip?.address,
    devices: hostData[0]?.hosts?.list,
  });
}
