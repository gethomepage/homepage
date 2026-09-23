import { getPrivateWidgetOptions } from "utils/config/widget-helpers";
import createLogger from "utils/logger";
import { sanitizeErrorURL } from "utils/proxy/api-helpers";
import { httpProxy } from "utils/proxy/http";

const logger = createLogger("customapi");

export default async function handler(req, res) {
  const { index } = req.query;

  const options = await getPrivateWidgetOptions("customapi", index);

  if (!options?.url) {
    return res.status(400).json({ error: "Missing Custom API URL" });
  }

  let url;
  try {
    url = new URL(options.url);
  } catch {
    return res.status(400).json({ error: "Invalid Custom API URL" });
  }

  const headers = { ...(options.headers ?? {}) };
  if (options.username && options.password) {
    headers.Authorization = `Basic ${Buffer.from(`${options.username}:${options.password}`).toString("base64")}`;
  }

  const params = { method: options.method ?? "GET", headers };
  if (options.requestBody) {
    params.body = typeof options.requestBody === "object" ? JSON.stringify(options.requestBody) : options.requestBody;
  }

  const [status, contentType, data] = await httpProxy(url, params);

  if (status >= 400) {
    logger.debug("HTTP Error %d calling %s//%s%s", status, url.protocol, url.host, url.pathname);
    return res.status(status).json({ error: { message: "HTTP Error", url: sanitizeErrorURL(url) } });
  }

  if (contentType) res.setHeader("Content-Type", contentType);

  return res.status(status).send(data);
}
