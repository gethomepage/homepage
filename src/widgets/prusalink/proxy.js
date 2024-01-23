import { httpProxy } from "utils/proxy/http";
import { formatApiCall } from "utils/proxy/api-helpers";
import getServiceWidget from "utils/config/service-helpers";
import createLogger from "utils/logger";
import widgets from "widgets/widgets";

const proxyName = "prusalinkProxyHandler";
const logger = createLogger(proxyName);

async function retrieveFromAPI(url, key) {
  const headers = {
    "content-type": "application/json",
    "X-Api-Key": key,
  };

  const [status, , data] = await httpProxy(url, { headers });

  if (status !== 200) {
    throw new Error(`Error getting data from prusalink: ${status}. Data: ${data.toString()}`);
  }

  return JSON.parse(Buffer.from(data).toString());
}

export default async function prusalinkProxyHandler(req, res) {
  const { group, service, endpoint } = req.query;

  if (!group || !service) {
    logger.debug("Invalid or missing service '%s' or group '%s'", service, group);
    return res.status(400).json({ error: "Invalid proxy service type" });
  }

  const widget = await getServiceWidget(group, service);

  if (!widget) {
    logger.debug("Invalid or missing widget for service '%s' in group '%s'", service, group);
    return res.status(400).json({ error: "Invalid proxy service type" });
  }

  if (!widget.key) {
    logger.debug("Invalid or missing key for service '%s' in group '%s'", service, group);
    return res.status(400).json({ error: "Missing widget key" });
  }

  const apiURL = widgets[widget.type].api;

  try {
    const url = new URL(formatApiCall(apiURL, { endpoint, ...widget }));
    const prusalinkData = await retrieveFromAPI(url, widget.key);

    const prusalinkStats = {
      state: prusalinkData.state,
      progress: prusalinkData.progress?.completion,
      printTime: prusalinkData.progress?.printTime,
      printTimeLeft: prusalinkData.progress?.printTimeLeft,
    };

    return res.status(200).send(prusalinkStats);
  } catch (e) {
    logger.error(e.message);
    return res.status(500).send({ error: { message: e.message } });
  }
}
