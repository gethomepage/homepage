import getServiceWidget from "utils/service-helpers";
import { formatApiCall } from "utils/api-helpers";
import { httpProxy } from "utils/http";

export default async function credentialedProxyHandler(req, res) {
  const { group, service, endpoint } = req.query;

  if (group && service) {
    const widget = await getServiceWidget(group, service);

    var headersData
    if(widget.type == "gotify"){
      headersData = {"X-gotify-Key": `${widget.key}`,"Content-Type": "application/json",}
    }else{
      headersData = {"X-API-Key": `${widget.key}`,"Content-Type": "application/json",}
    }

    if (widget) {
      const url = new URL(formatApiCall(widget.type, { endpoint, ...widget }));
      const [status, contentType, data] = await httpProxy(url, {
        withCredentials: true,
        credentials: "include",
        headers: headersData,
      });

      if (contentType) res.setHeader("Content-Type", contentType);
      return res.status(status).send(data);
    }
  }

  return res.status(400).json({ error: "Invalid proxy service type" });
}
