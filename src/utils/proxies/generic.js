import getServiceWidget from "utils/service-helpers";
import { formatApiCall } from "utils/api-helpers";
import { httpProxy } from "utils/http";

export default async function genericProxyHandler(req, res) {
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

      if (contentType) res.setHeader("Content-Type", contentType);

      if (status === 204 || status === 304) {
        return res.status(status).end();
      }

      return res.status(status).send(data);
    }
  }

  return res.status(400).json({ error: "Invalid proxy service type" });
}
