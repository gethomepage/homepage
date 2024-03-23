import { httpProxy } from "utils/proxy/http";
import { formatApiCall } from "utils/proxy/api-helpers";
import getServiceWidget from "utils/config/service-helpers";
import createLogger from "utils/logger";
import widgets from "widgets/widgets";

const logger = createLogger("jackettProxyHandler");

async function fetchJackettCookie(widget, loginURL) {
  const url = new URL(formatApiCall(loginURL, widget));
  const loginData = `password=${encodeURIComponent(widget.password)}`;
  const [status, , , , params] = await httpProxy(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: loginData,
  });

  if (!(status === 200) || !params?.headers?.Cookie) {
    logger.error("Failed to fetch Jackett cookie, status: %d", status);
    return null;
  }
  return params.headers.Cookie;
}

export default async function jackettProxyHandler(req, res) {
  const { group, service, endpoint } = req.query;

  if (!group || !service) {
    logger.error("Invalid or missing service '%s' or group '%s'", service, group);
    return res.status(400).json({ error: "Invalid proxy service type" });
  }

  const widget = await getServiceWidget(group, service);
  if (!widget || !widgets[widget.type].api) {
    logger.error("Invalid or missing widget for service '%s' in group '%s'", service, group);
    return res.status(400).json({ error: "Invalid widget configuration" });
  }

  if (widget.password) {
    const jackettCookie = await fetchJackettCookie(widget, widgets[widget.type].loginURL);
    if (!jackettCookie) {
      return res.status(500).json({ error: "Failed to authenticate with Jackett" });
    }
    // Add the cookie to the widget for use in subsequent requests
    widget.headers = { ...widget.headers, Cookie: jackettCookie };
  }

  const url = new URL(formatApiCall(widgets[widget.type].api, { endpoint, ...widget }));

  try {
    const [status, , data] = await httpProxy(url, {
      method: "GET",
      headers: widget.headers,
    });

    if (status !== 200) {
      logger.error("Error calling Jackett API: %d. Data: %s", status, data);
      return res.status(status).json({ error: "Failed to call Jackett API", data });
    }

    return res.status(status).send(data);
  } catch (error) {
    logger.error("Exception calling Jackett API: %s", error.message);
    return res.status(500).json({ error: "Server error", message: error.message });
  }
}
