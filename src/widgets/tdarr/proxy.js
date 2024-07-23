import { httpProxy } from "utils/proxy/http";
import { formatApiCall } from "utils/proxy/api-helpers";
import getServiceWidget from "utils/config/service-helpers";
import createLogger from "utils/logger";
import widgets from "widgets/widgets";

const proxyName = "tdarrProxyHandler";
const logger = createLogger(proxyName);

export default async function tdarrProxyHandler(req, res) {
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

  const url = new URL(formatApiCall(widgets[widget.type].api, { endpoint: undefined, ...widget }));

  const [status, contentType, data] = await httpProxy(url, {
    method: "POST",
    body: JSON.stringify({
      data: {
        collection: "StatisticsJSONDB",
        mode: "getById",
        docID: "statistics",
      },
    }),
    headers: {
      "content-type": "application/json",
    },
  });

  if (status !== 200) {
    logger.error("Error getting data from Tdarr: %d.  Data: %s", status, data);
    return res.status(500).send({ error: { message: "Error getting data from Tdarr", url, data } });
  }

  if (contentType) res.setHeader("Content-Type", contentType);
  return res.status(status).send(data);
}
