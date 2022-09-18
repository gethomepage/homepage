import getServiceWidget from "utils/service-helpers";
import { formatApiCall } from "utils/api-helpers";
import { httpProxy } from "utils/http";

export default async function credentialedProxyHandler(req, res) {
  const { group, service, endpoint } = req.query;

  if (group && service) {
    const widget = await getServiceWidget(group, service);

    if (widget) {
      const url = new URL(formatApiCall(widget.type, { endpoint, ...widget }));

      const headers = {
        "Content-Type": "application/json",
      };

      if (widget.type === "coinmarketcap") {
        headers["X-CMC_PRO_API_KEY"] = `${widget.key}`;
      } else if (widget.type === "gotify") {
        headers["X-gotify-Key"] = `${widget.key}`;
      } else if (widget.type === "authentik") {
        headers.Authorization = `Bearer ${widget.key}`;
      } else {
        headers["X-API-Key"] = `${widget.key}`;
      }

      const [status, contentType, data] = await httpProxy(url, {
        method: "GET",  // disallow a client SWR call to set a destructive HTTP verb
        withCredentials: true,
        credentials: "include",
        headers,
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
