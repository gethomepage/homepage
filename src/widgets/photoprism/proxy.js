import { formatApiCall } from "utils/proxy/api-helpers";
import { httpProxy } from "utils/proxy/http";
import getServiceWidget from "utils/config/service-helpers";
import createLogger from "utils/logger";

const logger = createLogger("photoprismProxyHandler");

export default async function photoprismProxyHandler(req, res) {
  const { group, service } = req.query;

  if (!group || !service) {
    logger.debug("Invalid or missing service '%s' or group '%s'", service, group);
    return res.status(400).json({ error: "Invalid proxy service type" });
  }

  const widget = await getServiceWidget(group, service);

  if (!widget) {
    logger.debug("Invalid or missing widget for service '%s' in group '%s'", service, group);
    return res.status(400).json({ error: "Invalid proxy service type" });
  }

  const url = new URL(formatApiCall("{url}/api/v1/session", { ...widget }));
  const params = {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: null,
  };

  if (widget.username && widget.password) {
    params.body = JSON.stringify({
      username: widget.username,
      password: widget.password,
    });
  } else if (widget.key) {
    params.headers.Authorization = `Bearer ${widget.key}`;
    params.body = JSON.stringify({
      authToken: widget.key,
    });
  }

  const [status, contentType, data] = await httpProxy(url, params);

  if (status !== 200) {
    logger.error("HTTP %d getting data from PhotoPrism. Data: %s", status, data);
    return res.status(status).json({ error: { message: `HTTP Error ${status}`, url, data } });
  }

  const json = JSON.parse(data.toString());

  if (contentType) res.setHeader("Content-Type", contentType);
  return res.status(200).send(json?.config?.count);
}
