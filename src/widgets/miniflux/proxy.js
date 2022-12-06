import { formatApiCall } from "utils/proxy/api-helpers";
import { httpProxy } from "utils/proxy/http";
import getServiceWidget from "utils/config/service-helpers";
import createLogger from "utils/logger";

const logger = createLogger("minifluxProxyHandler");

export default async function minifluxProxyHandler(req, res) {
  const { group, service } = req.query;

  if (!group || !service) {
    logger.debug("Invalid or missing service '%s' or group '%s'", service, group);
    return res.status(400).json({ error: "Invalid proxy service type" });
  }

  const widget = await getServiceWidget(group, service);
  if (!widget) {
    logger.debug("Invalid or missing widget for service '%s' in group '%s'", service, group);
    return res.status(400).json({ error: "Invalid proxy service type" });
  }

  const url = new URL(formatApiCall("{url}/v1/feeds/counters", { ...widget }));
  url.username = widget.username;
  url.password = widget.password;

  const params = {
    method: "GET",
    headers: {
      "X-Auth-Token": widget.token
    }
  };

  // eslint-disable-next-line no-unused-vars
  const [status, contentType, data] = await httpProxy(url, params);

  let read = 0;
  let unread = 0;
  if (status === 200) {
    const parsed = JSON.parse(data.toString());
    read = Object.values(parsed.reads).reduce((acc, i) => acc + i, 0);
    unread = Object.values(parsed.unreads).reduce((acc, i) => acc + i, 0);
  }

  return res.status(status).send({ read, unread });
}
