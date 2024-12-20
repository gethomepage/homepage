import { httpProxy } from "utils/proxy/http";
import { formatApiCall } from "utils/proxy/api-helpers";
import getServiceWidget from "utils/config/service-helpers";
import createLogger from "utils/logger";
import widgets from "widgets/widgets";

const proxyName = "watchtowerProxyHandler";
const logger = createLogger(proxyName);

export default async function watchtowerProxyHandler(req, res) {
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

  const [status, contentType, data] = await httpProxy(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${widget.key}`,
    },
  });

  if (status !== 200 || !data) {
    logger.error("Error getting data from WatchTower: %d.  Data: %s", status, data);
    return res.status(status).json({ error: { message: `HTTP Error ${status}`, url, data } });
  }

  const cleanData = data
    .toString()
    .split("\n")
    .filter((s) => s.startsWith("watchtower"));
  const jsonRes = {};

  cleanData
    .map((e) => e.split(" "))
    .forEach((strArray) => {
      const [key, value] = strArray;
      jsonRes[key] = value;
    });

  if (contentType) res.setHeader("Content-Type", contentType);
  return res.status(status).send(jsonRes);
}
