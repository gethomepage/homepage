import getServiceWidget from "utils/service-helpers";
import { formatApiCall } from "utils/api-helpers";

export default async function npmProxyHandler(req, res) {
  const { group, service, endpoint } = req.query;

  if (group && service) {
    const widget = await getServiceWidget(group, service);

    if (widget) {
      const url = new URL(formatApiCall(widget.type, { endpoint, ...widget }));

      const loginUrl = `${widget.url}/api/tokens`;
      const body = { identity: widget.username, secret: widget.password };

      const authResponse = await fetch(loginUrl, {
        method: "POST",
        body: JSON.stringify(body),
        headers: {
          "Content-Type": "application/json",
        },
      }).then((response) => response.json());

      const apiResponse = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authResponse.token}`,
        },
      }).then((response) => response.json());

      return res.send(apiResponse);
    }
  }

  return res.status(400).json({ error: "Invalid proxy service type" });
}
