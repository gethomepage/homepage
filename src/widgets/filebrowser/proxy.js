import getServiceWidget from "utils/config/service-helpers";
import createLogger from "utils/logger";
import { formatApiCall } from "utils/proxy/api-helpers";
import { httpProxy } from "utils/proxy/http";
import widgets from "widgets/widgets";

const proxyName = "filebrowserProxyHandler";
const logger = createLogger(proxyName);

async function login(widget, service) {
  const url = formatApiCall(widgets[widget.type].api, { ...widget, endpoint: "login" });
  const headers = {};
  if (widget.authHeader) {
    headers[widget.authHeader] = widget.username;
  }
  const [status, , data] = await httpProxy(url, {
    method: "POST",
    headers,
    body: JSON.stringify({
      username: widget.username,
      password: widget.password,
    }),
  });

  switch (status) {
    case 200:
      return data;
    case 401:
      logger.error("Unauthorized access to Filebrowser API for service '%s'. Check credentials.", service);
      break;
    default:
      logger.error("Unexpected status code %d when logging in to Filebrowser API for service '%s'", status, service);
      break;
  }
}

export default async function filebrowserProxyHandler(req, res) {
  const { group, service, endpoint, index } = req.query;

  if (!group || !service) {
    logger.error("Invalid or missing service '%s' or group '%s'", service, group);
    return res.status(400).json({ error: "Invalid proxy service type" });
  }

  const widget = await getServiceWidget(group, service, index);
  if (!widget || !widgets[widget.type].api) {
    logger.error("Invalid or missing widget for service '%s' in group '%s'", service, group);
    return res.status(400).json({ error: "Invalid widget configuration" });
  }

  const token = await login(widget, service);
  if (!token) {
    return res.status(500).json({ error: "Failed to authenticate with Filebrowser" });
  }

  const url = new URL(formatApiCall(widgets[widget.type].api, { endpoint, ...widget }));

  try {
    const params = {
      method: "GET",
      headers: {
        "X-AUTH": token,
      },
    };

    logger.debug("Calling Filebrowser API endpoint: %s", endpoint);

    const [status, , data] = await httpProxy(url, params);

    if (status !== 200) {
      logger.error("Error calling Filebrowser API: %d. Data: %s", status, data);
      return res.status(status).json({ error: "Filebrowser API Error", data });
    }

    return res.status(status).send(data);
  } catch (error) {
    logger.error("Exception calling Filebrowser API: %s", error.message);
    return res.status(500).json({ error: "Filebrowser API Error", message: error.message });
  }
}
