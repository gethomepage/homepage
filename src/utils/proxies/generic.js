import { getServiceWidget } from "utils/service-helpers";
import { formatApiCall } from "utils/api-helpers";
import { httpProxy } from "utils/http";

export default async function genericProxyHandler(req, res) {
  const { group, service, endpoint } = req.query;

  if (group && service) {
    const widget = await getServiceWidget(group, service);

    if (widget) {
      const url = new URL(formatApiCall(widget.type, { endpoint, ...widget }));
      const [status, contentType, data] = await httpProxy(url);

      if (contentType) res.setHeader("Content-Type", contentType);
      return res.status(status).send(data);
    }
  }

  return res.status(400).json({ error: "Invalid proxy service type" });
}
