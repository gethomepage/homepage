import getServiceWidget from "utils/service-helpers";
import { formatApiCall } from "utils/api-helpers";
import { httpProxy } from "utils/http";

export default async function coinMarketCapProxyHandler(req, res) {
  const { group, service, endpoint } = req.query;

  if (group && service) {
    const widget = await getServiceWidget(group, service);

    if (widget) {
      const url = new URL(formatApiCall(widget.type, { endpoint, ...widget }));
      const [status, contentType, data] = await httpProxy(url, {
        method: req.method,
        withCredentials: true,
        credentials: "include",
        headers: {
          "X-CMC_PRO_API_KEY": `${widget.key}`,
          "Content-Type": "application/json",
        },
      });

      if (status === 204 || status === 304) {
        return res.status(status).end();
      }

      if (contentType) res.setHeader("Content-Type", contentType);
      return res.status(status).send(data);
    }
  }

  return res.status(400).json({ error: "Invalid proxy service type" });
}
