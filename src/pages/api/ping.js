import { performance } from "perf_hooks";

import createLogger from "utils/logger";
import { httpProxy } from "utils/proxy/http";

const logger = createLogger("ping");

export default async function handler(req, res) {
    const { ping: pingURL } = req.query;

    if (!pingURL) {
        logger.debug("No ping URL specified");
        return res.status(400).send({
        error: "No ping URL given",
        });
    }
    
    let startTime = performance.now();
    let [status] = await httpProxy(pingURL, {
      method: "HEAD"
    });
    let endTime = performance.now();
    
    if (status >= 400) {
      // try one more time as a GET in case HEAD is rejected for whatever reason
      startTime = performance.now();
      [status] = await httpProxy(pingURL);
      endTime = performance.now();
    }

    return res.status(200).json({
      status,
      latency: endTime - startTime
    });
}
