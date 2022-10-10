import { httpProxy } from "utils/proxy/http";
import createLogger from "utils/logger";

const logger = createLogger("glances");

export default async function handler(req, res) {
  const { url } = req.query;
  
  if (!url) {
    return res.status(400).json({ error: "Missing Glances URL" });
  }

  const apiUrl = `${url}/api/3/quicklook`;
  const params = { method: "GET", headers: {
    "Accept-Encoding": "application/json"
  } };

  const [status, contentType, data] = await httpProxy(apiUrl, params);

  if (status !== 200) {
    logger.error("HTTP %d getting data from glances API %s. Data: %s", status, apiUrl, data);
  }

  if (contentType) res.setHeader("Content-Type", contentType);
  return res.status(status).send(data);
}
