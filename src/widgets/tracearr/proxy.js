import getServiceWidget from "utils/config/service-helpers";
import createLogger from "utils/logger";
import { formatApiCall } from "utils/proxy/api-helpers";
import { httpProxy } from "utils/proxy/http";
import widgets from "widgets/widgets";

const proxyName = "tracearrProxyHandler";
const logger = createLogger(proxyName);

export default async function tracearrProxyHandler(req, res) {
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

  const apiURL = widgets[widget.type].api;
  const url = new URL(formatApiCall(apiURL, { endpoint, ...widget }));

  const headers = {
    "content-type": "application/json",
    Authorization: `Bearer ${widget.key}`,
  };

  const [status, , data] = await httpProxy(url, { headers });

  if (status !== 200) {
    logger.error("Error fetching data from Tracearr: %d", status);
    return res.status(status).json({
      error: {
        message: "HTTP Error",
        url: url.toString(),
        data: data?.toString() ?? "Unknown error",
      },
    });
  }

  return res.status(200).send(data);
}
