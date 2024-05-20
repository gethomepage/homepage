import { performance } from "perf_hooks";

import { getServiceItem } from "utils/config/service-helpers";
import createLogger from "utils/logger";
import { httpProxy } from "utils/proxy/http";

const logger = createLogger("siteMonitor");

export default async function handler(req, res) {
  const { group, service } = req.query;
  const serviceItem = await getServiceItem(group, service);
  if (!serviceItem) {
    logger.debug(`No service item found for group ${group} named ${service}`);
    return res.status(400).send({
      error: "Unable to find service, see log for details.",
    });
  }

  const { href, siteMonitor } = serviceItem;

  if (!siteMonitor) {
    logger.debug("No http monitor URL specified");
    return res.status(400).send({
      error: "No http monitor URL given",
    });
  }
  let monitorURL = siteMonitor;
  
  if (siteMonitor === true) {
    // if monitor is set to "true", use the href as the monitor target
    if (!href) {
      logger.error(`Monitoring requestd for service '${service}' but no url specified.\n\tEither set monitor to a url or set href`);
      return res.status(400).send({
        error: "No url specified for monitor, see logs.",
      });
    }
    monitorURL = href;
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
