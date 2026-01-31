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

  const [status, contentType, data] = await httpProxy(url, params);

  let resultData = data;

  if (resultData.error?.url) {
    resultData.error.url = sanitizeErrorURL(url);
  }

  if (status === 204 || status === 304) {
    return res.status(status).end();
  }

  if (status >= 400) {
    logger.error("HTTP Error %d calling %s", status, url.toString());
  }

  if (status === 200) {
    if (!validateWidgetData(widget, endpoint, resultData)) {
      return res.status(500).json({ error: { message: "Invalid data", url: sanitizeErrorURL(url), data: resultData } });
    }
    if (map) resultData = map(resultData);
  }

  if (contentType) res.setHeader("Content-Type", contentType);
  return res.status(status).send(resultData);
}
