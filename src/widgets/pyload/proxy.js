import getServiceWidget from "utils/config/service-helpers";
import { formatApiCall } from "utils/proxy/api-helpers";
import widgets from "widgets/widgets";

export default async function pyloadProxyHandler(req, res) {
  const { group, service, endpoint } = req.query;

  if (group && service) {
    const widget = await getServiceWidget(group, service);

    if (widget) {
      const url = new URL(formatApiCall(widgets[widget.type].api, { endpoint, ...widget }));
      const loginUrl = `${widget.url}/api/login`;

      // Pyload api does not support argument passing as JSON.
      const sessionId = await fetch(loginUrl, {
        method: "POST",
        // Empty passwords are supported.
        body: `username=${widget.username}&password=${widget.password ?? ''}`,
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }).then((response) => response.json());

      const apiResponse = await fetch(url, {
        method: "POST",
        body: `session=${sessionId}`,
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }).then((response) => response.json());

      return res.send(apiResponse);
    }
  }

  return res.status(400).json({ error: "Invalid proxy service type" });
}
