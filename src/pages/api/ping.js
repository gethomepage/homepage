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
    
    const startTime = performance.now();
    const [status] = await httpProxy(pingURL, {
      method: "HEAD"
    });
    const endTime = performance.now();

    return res.status(200).json({
      status,
      latency: endTime - startTime
    });
}
