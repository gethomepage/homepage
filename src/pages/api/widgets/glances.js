import { httpProxy } from "utils/proxy/http";
import createLogger from "utils/logger";
import { getPrivateWidgetOptions } from "utils/config/widget-helpers";

const logger = createLogger("glances");

export default async function handler(req, res) {
  const { index } = req.query;

  const privateWidgetOptions = await getPrivateWidgetOptions("glances", index);
  
  const url = privateWidgetOptions?.url;
  if (!url) {
    const errorMessage = "Missing Glances URL";
    logger.error(errorMessage);
    return res.status(400).json({ error: errorMessage });
  }

  const apiUrl = `${url}/api/3/quicklook`;
  const headers = {
    "Accept-Encoding": "application/json"
  };
  if (privateWidgetOptions.username && privateWidgetOptions.password) {
    headers.Authorization = `Basic ${Buffer.from(`${privateWidgetOptions.username}:${privateWidgetOptions.password}`).toString("base64")}`
  }
  const params = { method: "GET", headers };

  const [status, contentType, data] = await httpProxy(apiUrl, params);

  if (status === 401) {
    logger.error("Authorization failure getting data from glances API. Data: %s", data);
  }

  if (status !== 200) {
    logger.error("HTTP %d getting data from glances API. Data: %s", status, data);
  }

  if (contentType) res.setHeader("Content-Type", contentType);
  return res.status(status).send(data);
}
