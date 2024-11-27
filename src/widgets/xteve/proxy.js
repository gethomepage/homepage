import { formatApiCall } from "utils/proxy/api-helpers";
import { httpProxy } from "utils/proxy/http";
import createLogger from "utils/logger";
import widgets from "widgets/widgets";
import getServiceWidget from "utils/config/service-helpers";

const logger = createLogger("xteveProxyHandler");

export default async function xteveProxyHandler(req, res) {
  const { group, service, index } = req.query;

  if (!group || !service) {
    return res.status(400).json({ error: "Invalid proxy service type" });
  }

  const widget = await getServiceWidget(group, service, index);
  const api = widgets?.[widget.type]?.api;
  if (!api) {
    return res.status(403).json({ error: "Service does not support API calls" });
  }

  const url = formatApiCall(api, { endpoint: "api/", ...widget });
  const method = "POST";
  const payload = { cmd: "status" };

  if (widget.username && widget.password) {
    // eslint-disable-next-line no-unused-vars
    const [status, contentType, data] = await httpProxy(url, {
      method,
      body: JSON.stringify({
        cmd: "login",
        username: widget.username,
        password: widget.password,
      }),
    });

    if (status !== 200) {
      logger.debug("Error logging into xteve", status, url);
      return res.status(status).json({ error: { message: `HTTP Error ${status} logging into xteve`, url, data } });
    }

    const json = JSON.parse(data.toString());

    if (json?.status !== true) {
      return res.status(401).json({ error: { message: "Authentication failed", url, data } });
    }

    payload.token = json.token;
  }

  const [status, contentType, data] = await httpProxy(url, {
    method,
    body: JSON.stringify(payload),
  });

  if (status !== 200) {
    logger.debug("Error %d calling xteve endpoint %s", status, url);
    return res.status(status).json({ error: { message: `HTTP Error ${status}`, url, data } });
  }

  if (contentType) res.setHeader("Content-Type", contentType);
  return res.status(status).send(data);
}
