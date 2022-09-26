import { httpProxy } from "utils/proxy/http";
import { formatApiCall } from "utils/proxy/api-helpers";
import getServiceWidget from "utils/config/service-helpers";

export default async function transmissionProxyHandler(req, res) {
  const { group, service, endpoint } = req.query;

  if (!group || !service) {
    return res.status(400).json({ error: "Invalid proxy service type" });
  }

  const widget = await getServiceWidget(group, service);

  if (!widget) {
    return res.status(400).json({ error: "Invalid proxy service type" });
  }

  const url = new URL(formatApiCall(widget.type, { endpoint, ...widget }));
  const csrfHeaderName = "x-transmission-session-id";

  const method = "POST";
  const auth = `${widget.username}:${widget.password}`;
  const body = JSON.stringify({
    method: "torrent-get",
    arguments: {
      fields: ["percentDone", "status", "rateDownload", "rateUpload"],
    },
  });

  const headers = {
    "content-type": "application/json",
  };

  let [status, contentType, data, responseHeaders] = await httpProxy(url, {
    method,
    auth,
    body,
    headers,
  });

  if (status === 409) {
    // Transmission is rejecting the request, but returning a CSRF token
    headers[csrfHeaderName] = responseHeaders[csrfHeaderName];

    // retry the request, now with the CSRF token
    [status, contentType, data, responseHeaders] = await httpProxy(url, {
      method,
      auth,
      body,
      headers,
    });
  }

  if (contentType) res.setHeader("Content-Type", contentType);
  return res.status(status).send(data);
}
