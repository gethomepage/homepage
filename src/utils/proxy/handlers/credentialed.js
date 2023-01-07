import getServiceWidget from "utils/config/service-helpers";
import { formatApiCall } from "utils/proxy/api-helpers";
import validateWidgetData from "utils/proxy/validate-widget-data";
import { httpProxy } from "utils/proxy/http";
import createLogger from "utils/logger";
import widgets from "widgets/widgets";

const logger = createLogger("credentialedProxyHandler");

export default async function credentialedProxyHandler(req, res, map) {
  const { group, service, endpoint } = req.query;

  if (group && service) {
    const widget = await getServiceWidget(group, service);

    if (!widgets?.[widget.type]?.api) {
      return res.status(403).json({ error: "Service does not support API calls" });
    }

    if (widget) {
      const url = new URL(formatApiCall(widgets[widget.type].api, { endpoint, ...widget }));

      const headers = {
        "Content-Type": "application/json",
      };

      if (widget.type === "coinmarketcap") {
        headers["X-CMC_PRO_API_KEY"] = `${widget.key}`;
      } else if (widget.type === "gotify") {
        headers["X-gotify-Key"] = `${widget.key}`;
      } else if (widget.type === "authentik") {
        headers.Authorization = `Bearer ${widget.key}`;
      } else if (widget.type === "truenas") {
        headers.Authorization = `Bearer ${widget.key}`;
      } else if (widget.type === "proxmox") {
        headers.Authorization = `PVEAPIToken=${widget.username}=${widget.password}`;
      } else if (widget.type === "autobrr") {
        headers["X-API-Token"] = `${widget.key}`;
      } else if (widget.type === "tubearchivist") {
        headers.Authorization = `Token ${widget.key}`;
      } else if (widget.type === "miniflux") {
        headers["X-Auth-Token"] = `${widget.key}`;
      } else {
        headers["X-API-Key"] = `${widget.key}`;
      }

      const [status, contentType, data] = await httpProxy(url, {
        method: req.method,
        withCredentials: true,
        credentials: "include",
        headers,
      });

      let resultData = data;

      if (status === 204 || status === 304) {
        return res.status(status).end();
      }

      if (status >= 400) {
        logger.error("HTTP Error %d calling %s", status, url.toString());
      }

      if (!validateWidgetData(widget, endpoint, data)) {
        return res.status(500).json({error: {message: "Invalid data", url, data}});
      }

      if (status === 200 && map) {
        resultData = map(data);
      }

      if (contentType) res.setHeader("Content-Type", contentType);
      return res.status(status).send(resultData);
    }
  }

  logger.debug("Invalid or missing proxy service type '%s' in group '%s'", service, group);
  return res.status(400).json({ error: "Invalid proxy service type" });
}
