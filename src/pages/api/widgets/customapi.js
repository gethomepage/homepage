import { getPrivateWidgetOptions } from "utils/config/widget-helpers";
import createLogger from "utils/logger";
import { sanitizeErrorURL } from "utils/proxy/api-helpers";
import { httpProxy } from "utils/proxy/http";

const logger = createLogger("customapi");

export default async function handler(req, res) {
  const { index } = req.query;

  const privateWidgetOptions = await getPrivateWidgetOptions("customapi", index);

  if (!privateWidgetOptions?.url) {
    logger.error("Missing Custom API URL");
    return res.status(400).json({ error: "Missing Custom API URL" });
  }

  let url;
  try {
    url = new URL(privateWidgetOptions.url);
  } catch (e) {
    logger.error("Invalid Custom API URL");
    return res.status(400).json({ error: "Invalid Custom API URL" });
  }

  const headers = { ...(privateWidgetOptions.headers ?? {}) };
  if (privateWidgetOptions.username && privateWidgetOptions.password) {
    headers.Authorization = `Basic ${Buffer.from(
      `${privateWidgetOptions.username}:${privateWidgetOptions.password}`,
    ).toString("base64")}`;
  }

  const params = { method: privateWidgetOptions.method ?? "GET", headers };

  const { requestBody } = privateWidgetOptions;
  if (requestBody) {
    params.body = typeof requestBody === "object" ? JSON.stringify(requestBody) : requestBody;
  }

  try {
    const [status, , data] = await httpProxy(url, params);

    if (status !== 200) {
      logger.error("HTTP %d getting data from custom API %s", status, url.hostname);
      return res.status(400).json({ error: `HTTP ${status} getting data from ${sanitizeErrorURL(url.toString())}` });
    }

    return res.status(200).send(JSON.parse(Buffer.from(data).toString()));
  } catch (e) {
    logger.error("Error getting data from custom API %s: %s", url.hostname, e);
    return res.status(400).json({ error: `Error getting data from ${sanitizeErrorURL(url.toString())}` });
  }
}
