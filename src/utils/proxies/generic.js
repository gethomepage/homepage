import getServiceWidget from "utils/service-helpers";
import { formatApiCall } from "utils/api-helpers";
import { httpProxy } from "utils/http";
import createLogger from "utils/logger";

const logger = createLogger('genericProxyHandler');

export default async function genericProxyHandler(req, res, maps) {
  const { group, service, endpoint } = req.query;

  if (group && service) {
    const widget = await getServiceWidget(group, service);

    if (widget) {
      const url = new URL(formatApiCall(widget.type, { endpoint, ...widget }));

      let headers;
      if (widget.username && widget.password) {
        headers = {
          Authorization: `Basic ${Buffer.from(`${widget.username}:${widget.password}`).toString("base64")}`,
        };
      }

      const [status, contentType, data] = await httpProxy(url, {
        method: req.method,
        headers,
      });

      let resultData = data;
      if ((status === 200) && (maps?.[endpoint])) {
        resultData = maps[endpoint](data);
      }

      if (contentType) res.setHeader("Content-Type", contentType);

      if (status === 204 || status === 304) {
        return res.status(status).end();
      }

      if (status >= 400) {
        logger.debug("HTTP Error %d calling %s//%s%s...", status, url.protocol, url.hostname, url.pathname);
      }

      return res.status(status).send(resultData);
    }
  }

  logger.debug("Invalid or missing proxy service type '%s' in group '%s'", service, group);
  return res.status(400).json({ error: "Invalid proxy service type" });
}
