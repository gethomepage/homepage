import { performance } from "perf_hooks";

import { getServiceItem } from "utils/config/service-helpers";
import createLogger from "utils/logger";
import { httpProxy } from "utils/proxy/http";

const logger = createLogger("ping");

export default async function handler(req, res) {
    const { group, service } = req.query;
    const serviceItem = await getServiceItem(group, service);
    if (!serviceItem) {
        logger.debug(`No service item found for group ${group} named ${service}`);
        return res.status(400).send({
          error: "Unable to find service, see log for details.",
        });
    }

    const { ping: pingURL } = serviceItem;

    if (!pingURL) {
        logger.debug("No ping URL specified");
        return res.status(400).send({
        error: "No ping URL given",
        });
    }

    try {
      let startTime = performance.now();
      let [status] = await httpProxy(pingURL, {
        method: "HEAD"
      });
      let endTime = performance.now();
      
      if (status > 403) {
        // try one more time as a GET in case HEAD is rejected for whatever reason
        startTime = performance.now();
        [status] = await httpProxy(pingURL);
        endTime = performance.now();
      }
  
      return res.status(200).json({
        status,
        latency: endTime - startTime
      });
    } catch (e) {
      logger.debug("Error attempting ping: %s", JSON.stringify(e));
      return res.status(400).send({
        error: 'Error attempting ping, see logs.',
      });
    }
}
