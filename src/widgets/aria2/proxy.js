import getServiceWidget from "utils/config/service-helpers";
import { httpProxy } from "utils/proxy/http";
import widgets from "widgets/widgets";
import { formatApiCall } from "utils/proxy/api-helpers";
import createLogger from "utils/logger";

const logger = createLogger("ariaProxyHandler");


export default async function ariaProxyHandler(req, res) {
  const { group, service, index } = req.query;

  if (group && service) {
    const widget = await getServiceWidget(group, service, index);

    if (widget) {
      if (widget.endpoint === undefined) {
        widget.endpoint = 'jsonrpc'
      }

      const api = widgets?.[widget.type]?.api;
      const url = new URL(formatApiCall(api, { ...widget }));

      const headers = {
        "content-type": "application/json",
        accept: "application/json",
      };
      if (widget.username) {
        headers.Authorization = `Basic ${Buffer.from(`${widget.username}:${widget.password}`).toString("base64")}`;
      }

      const rpcRequestBody = {
        id: "homepage",
        jsonrpc: "2.0",
        method: "aria2.getGlobalStat",
        params: []
      }

      if (widget.token !== undefined) {
        rpcRequestBody.params.push(`token:${widget.token}`)
      }

      const [status, , data] = await httpProxy(url, {
        method: "POST",
        headers,
        body: JSON.stringify(rpcRequestBody),
      });

      if (status !== 200) {
        logger.error("HTTP Error %d calling %s", status, url.toString());
        return res.status(status).json({ error: { message: "HTTP Error", url, data } });
      }

      try {
        const rawData = JSON.parse(data);

        return res.status(200).send(rawData.result); 
      } catch (e) {
        return res.status(500).json({ error: { message: e?.toString() ?? "Error parsing aria2 rpc data", url, data } });
      }
    }
  }

  return res.status(500).json({ error: "Invalid proxy service type" });
}
