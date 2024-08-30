import { performance } from "perf_hooks";

import { getServiceItem } from "utils/config/service-helpers";
import createLogger from "utils/logger";
var tcpp = require('tcp-ping');

const logger = createLogger("tcpHandshake");

export default async function handler(req, res) {
  const { group, service } = req.query;
  const serviceItem = await getServiceItem(group, service);
  if (!serviceItem) {
    logger.debug(`No service item found for group ${group} named ${service}`);
    return res.status(400).send({
      error: "Unable to find service, see log for details. Peace out!",
    });
  }

  const { tcpHandshake: monitorURL } = serviceItem;


  if (!monitorURL) {
    logger.debug("No tcp monitor URL specified");
    return res.status(400).send({
      error: "No tcp monitor URL given",
    });
  }

  console.log(typeof(monitorURL))
  const params = monitorURL.split(':', 2)

  try {
    let startTime = performance.now();
    await tcpp.probe(params[0], params[1], function(err, status) {
      let endTime = performance.now();

      return res.status(200).json({
        status,
        latency: endTime - startTime,
      });
    });

  } catch (e) {
    logger.debug("Error attempting http monitor: %s", e);
    return res.status(400).send({
      error: "Error attempting http monitor, see logs.",
      e,
    });
  }
}
