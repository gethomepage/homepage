import getServiceWidget from "utils/config/service-helpers";
import createLogger from "utils/logger";
import { formatApiCall, sanitizeErrorURL } from "utils/proxy/api-helpers";
import { httpProxy } from "utils/proxy/http";
import widgets from "widgets/widgets";

const logger = createLogger("dockhandProxyHandler");

async function login(widget) {
  if (!widget.username || !widget.password) return false;

  const baseUrl = widget.url?.replace(/\/+$/, "");
  const [status] = await httpProxy(`${baseUrl}/api/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ username: widget.username, password: widget.password }),
  });

  return status === 200;
}

export default async function dockhandProxyHandler(req, res) {
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

  const url = new URL(formatApiCall(widgets[widget.type].api, { endpoint, ...widget }));

  let [status, contentType, data] = await httpProxy(url, {
    method: req.method,
  });

  // Attempt login and retrying once
  if (status === 401) {
    const loggedIn = await login(widget);
    if (loggedIn) {
      [status, contentType, data] = await httpProxy(url, {
        method: req.method,
      });
    }
  }

  let resultData = data;

  if (status >= 400) {
    logger.error("HTTP Error %d calling %s", status, url.toString());
    return res.status(status).json({
      error: {
        message: "HTTP Error",
        url: sanitizeErrorURL(url),
        data: Buffer.isBuffer(resultData) ? Buffer.from(resultData).toString() : resultData,
      },
    });
  }

  if (contentType) res.setHeader("Content-Type", contentType);
  return res.status(status).send(resultData);
}
