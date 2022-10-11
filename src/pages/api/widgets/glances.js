import { httpProxy } from "utils/proxy/http";
import createLogger from "utils/logger";
import { getSettings } from "utils/config/config";

const logger = createLogger("glances");

export default async function handler(req, res) {
  const settings = getSettings()?.glances;
  if (!settings) {
    logger.error("There is no glances section in settings.yaml");
    return res.status(400).json({ error: "There is no glances section in settings.yaml" });
  }
  
  const url = settings?.url;
  if (!url) {
    logger.error("Missing Glances URL");
    return res.status(400).json({ error: "Missing Glances URL" });
  }

  const apiUrl = `${url}/api/3/quicklook`;
  const headers = {
    "Accept-Encoding": "application/json"
  };
  if (settings.username && settings.password) {
    headers.Authorization = `Basic ${Buffer.from(`${settings.username}:${settings.password}`).toString("base64")}`
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
