import getServiceWidget from "utils/config/service-helpers";
import createLogger from "utils/logger";
import { formatApiCall, sanitizeErrorURL } from "utils/proxy/api-helpers";
import { httpProxy } from "utils/proxy/http";
import validateWidgetData from "utils/proxy/validate-widget-data";
import widgets from "widgets/widgets";

const logger = createLogger("jellyfinProxyHandler");

export default async function jellyfinProxyHandler(req, res, map) {
  const { group, service, endpoint, index } = req.query;

  if (!group || !service) {
    logger.debug("Invalid or missing proxy service type '%s' in group '%s'", service, group);
    return res.status(400).json({ error: "Invalid proxy service type" });
  }

  const widget = await getServiceWidget(group, service, index);

  if (!widget || !widgets?.[widget.type]?.api) {
    logger.debug("Invalid or missing proxy service type '%s' in group '%s'", service, group);
    return res.status(403).json({ error: "Service does not support API calls" });
  }

  const url = new URL(formatApiCall(widgets[widget.type].api, { endpoint, ...widget }));

  const deviceIdRaw = widget.deviceId ?? `${widget.service_group || "group"}-${widget.service_name || "service"}`;
  const deviceId = encodeURIComponent(deviceIdRaw);
  const authHeader = `MediaBrowser Token="${encodeURIComponent(
    widget.key,
  )}", Client="Homepage", Device="Homepage", DeviceId="${deviceId}", Version="1.0.0"`;

  const headers = {
    Authorization: authHeader,
  };

  const params = {
    method: req.method,
    withCredentials: true,
    credentials: "include",
    headers,
  };

  let requestUrl = url;
  let [status, contentType, data] = await httpProxy(requestUrl, params);

  // Jellyfin 12 (10.12) removed the legacy `/emby/`-prefixed compatibility routes,
  // so a v1-style widget config gets a 404 against newer servers. When that happens,
  // transparently retry against the equivalent v2 endpoint (drop the `/emby/` prefix
  // and the `api_key` query param, which the Authorization header already provides).
  // This lets existing v1 configs keep working after a Jellyfin upgrade without
  // requiring the user to manually set `version: 2`.
  if (status === 404 && /(^|\/)emby\//.test(url.pathname)) {
    const v2Url = new URL(url);
    v2Url.pathname = v2Url.pathname.replace(/(^|\/)emby\//, "$1");
    v2Url.searchParams.delete("api_key");
    const [v2Status, v2ContentType, v2Data] = await httpProxy(v2Url, params);
    if (v2Status !== 404) {
      logger.debug("Jellyfin emby/ route returned 404, using v2 endpoint %s", v2Url.toString());
      requestUrl = v2Url;
      [status, contentType, data] = [v2Status, v2ContentType, v2Data];
    }
  }

  let resultData = data;

  if (resultData.error?.url) {
    resultData.error.url = sanitizeErrorURL(requestUrl);
  }

  if (status === 204 || status === 304) {
    return res.status(status).end();
  }

  if (status >= 400) {
    logger.error("HTTP Error %d calling %s", status, requestUrl.toString());
  }

  if (status === 200) {
    if (!validateWidgetData(widget, endpoint, resultData)) {
      return res
        .status(500)
        .json({ error: { message: "Invalid data", url: sanitizeErrorURL(requestUrl), data: resultData } });
    }
    if (map) resultData = map(resultData);
  }

  if (contentType) res.setHeader("Content-Type", contentType);
  return res.status(status).send(resultData);
}
