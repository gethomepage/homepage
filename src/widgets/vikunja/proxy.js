import { httpProxy } from "utils/proxy/http";
import { formatApiCall } from "utils/proxy/api-helpers";
import getServiceWidget from "utils/config/service-helpers";
import createLogger from "utils/logger";
import widgets from "widgets/widgets";

const proxyName = "vikunjaProxyHandler";
const logger = createLogger(proxyName);

export default async function vikunjaProxyHandler(req, res) {
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

  const url = new URL(formatApiCall(widgets[widget.type].api, { endpoint, ...widget }));

  try {
    const params = {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${widget.token}`,
      },
    };

    logger.debug("Calling Vikunja API endpoint: %s", endpoint);

    const [status, , data] = await httpProxy(url, params);

    if (status !== 200) {
      logger.error("Error calling Vikunja API: %d. Data: %s", status, data);
      return res.status(status).json({ error: "Vikunja API Error", data });
    }

    return res.status(status).send(data);
  } catch (error) {
    logger.error("Exception calling Vikunja API: %s", error.message);
    return res.status(500).json({ error: "Vikunja API Error", message: error.message });
  }
}
