import { performance } from "perf_hooks";

import { getServiceItem } from "utils/config/service-helpers";
import createLogger from "utils/logger";
import { httpProxy } from "utils/proxy/http";

const logger = createLogger("siteMonitor");

export default async function handler(req, res) {
  const { groupName, serviceName } = req.query;
  const serviceItem = await getServiceItem(groupName, serviceName);
  if (!serviceItem) {
    logger.debug(`No service item found for group ${groupName} named ${serviceName}`);
    return res.status(400).send({
      error: "Unable to find service, see log for details.",
    });
  }

  const { siteMonitor: monitorURL } = serviceItem;

  if (!monitorURL) {
    logger.debug("No http monitor URL specified");
    return res.status(400).send({
      error: "No http monitor URL given",
    });
  }

  try {
    let startTime = performance.now();
    let [status] = await httpProxy(monitorURL, {
      method: "HEAD",
    });
    let endTime = performance.now();

    if (status > 403) {
      // try one more time as a GET in case HEAD is rejected for whatever reason
      startTime = performance.now();
      [status] = await httpProxy(monitorURL);
      endTime = performance.now();
    }

    return res.status(200).json({
      status,
      latency: endTime - startTime,
    });
  } catch (e) {
    logger.debug("Error attempting http monitor: %s", e);
    return res.status(400).send({
      error: "Error attempting http monitor, see logs.",
    });
  }
}
