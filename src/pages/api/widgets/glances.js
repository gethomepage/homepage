import { httpProxy } from "utils/proxy/http";
import createLogger from "utils/logger";
import { getSettings } from "utils/config/config";

const logger = createLogger("glances");

export default async function handler(req, res) {
  const { id } = req.query;

  let errorMessage;

  let instanceID = "glances";
  if (id) { // multiple instances
    instanceID = id;
  }
  const settings = getSettings();
  const instanceSettings = settings[instanceID];
  if (!instanceSettings) {
    errorMessage = id ? `There is no glances section with id '${id}' in settings.yaml` : "There is no glances section in settings.yaml";
    logger.error(errorMessage);
    return res.status(400).json({ error: errorMessage });
  }
  
  const url = instanceSettings?.url;
  if (!url) {
    errorMessage = "Missing Glances URL";
    logger.error(errorMessage);
    return res.status(400).json({ error: errorMessage });
  }

  const apiUrl = `${url}/api/3/quicklook`;
  const headers = {
    "Accept-Encoding": "application/json"
  };
  if (instanceSettings.username && instanceSettings.password) {
    headers.Authorization = `Basic ${Buffer.from(`${instanceSettings.username}:${instanceSettings.password}`).toString("base64")}`
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
