import { JSONRPCClient } from "json-rpc-2.0";

import getServiceWidget from "utils/service-helpers";

export default async function nzbgetProxyHandler(req, res) {
  const { group, service, endpoint } = req.query;

  if (group && service) {
    const widget = await getServiceWidget(group, service);

    if (widget) {
      const constructedUrl = new URL(widget.url);
      constructedUrl.pathname = "jsonrpc";

      const authorization = Buffer.from(`${widget.username}:${widget.password}`).toString("base64");

      const client = new JSONRPCClient((jsonRPCRequest) =>
        fetch(constructedUrl.toString(), {
          method: "POST",
          headers: {
            "content-type": "application/json",
            authorization: `Basic ${authorization}`,
          },
          body: JSON.stringify(jsonRPCRequest),
        }).then(async (response) => {
          if (response.status === 200) {
            const jsonRPCResponse = await response.json();
            return client.receive(jsonRPCResponse);
          }

          return Promise.reject(new Error(response.statusText));
        })
      );

      return res.send(await client.request(endpoint));
    }
  }

  return res.status(400).json({ error: "Invalid proxy service type" });
}
