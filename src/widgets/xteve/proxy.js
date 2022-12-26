import { formatApiCall } from "utils/proxy/api-helpers";
import { httpProxy } from "utils/proxy/http";
import createLogger from "utils/logger";
import widgets from "widgets/widgets";
import getServiceWidget from "utils/config/service-helpers";

const logger = createLogger("xteveProxyHandler");

export default async function xteveProxyHandler(req, res) {
  const { group, service, endpoint } = req.query;

  if (!group || !service) {
    return res.status(400).json({ error: "Invalid proxy service type" });
  }

  const widget = await getServiceWidget(group, service);
  const api = widgets?.[widget.type]?.api;
  if (!api) {
    return res.status(403).json({ error: "Service does not support API calls" });
  }

  const url = formatApiCall(api, { endpoint, ...widget });
  const method = "POST";
  const payload = { "cmd": "status" };

  if (widget.username && widget.password) {
    const body = JSON.stringify({
      "cmd": "login",
      "username": widget.username,
      "password": widget.password,
     });

     const [status, contentType, data] = await httpProxy(url, {
      method,
      body,
    });

    if (status !== 200) {
      return [status, contentType, data];
    }

    const json = JSON.parse(data.toString());

    if (json?.status !== true) {
      const message = "Authentication failed.";
      return res.status(401).end(JSON.stringify({error: { message } }));
    }

    payload.token = json.token;
  }

  const body = JSON.stringify(payload);

  const [status, contentType, data] = await httpProxy(url, {
    method,
    body,
  });

  if (status !== 200) {
    logger.debug("Error %d calling endpoint %s", status, url);
    return res.status(status, data);
  }

  if (contentType) res.setHeader("Content-Type", contentType);
  return res.status(status).send(data);
}
