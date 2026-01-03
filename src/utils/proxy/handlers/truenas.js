import WebSocket from "ws";

import getServiceWidget from "utils/config/service-helpers";
import createLogger from "utils/logger";
import { formatApiCall } from "utils/proxy/api-helpers";
import widgets from "widgets/widgets";

const logger = createLogger("truenasProxyHandler");

export async function sendTruenasWsRequest(url, method, params, widget) {
  return new Promise((resolve, reject) => {
    const wsUrl = url.replace(/^http/, "ws");
    const ws = new WebSocket(wsUrl, { rejectUnauthorized: false });

    const timeout = setTimeout(() => {
      ws.close();
      reject(new Error("WebSocket connection timeout"));
    }, 10000);

    ws.on("open", () => {
      const authPayload = widget.key
        ? { jsonrpc: "2.0", method: "auth.login_with_api_key", params: [widget.key], id: 1 }
        : { jsonrpc: "2.0", method: "auth.login", params: [widget.username, widget.password], id: 1 };
      ws.send(JSON.stringify(authPayload));
    });

    ws.on("message", (raw) => {
      const response = JSON.parse(raw.toString());

      if (response.id === 1) {
        if (response.result) {
          ws.send(JSON.stringify({ jsonrpc: "2.0", method, params: params ?? [], id: 2 }));
        } else {
          clearTimeout(timeout);
          ws.close();
          reject(new Error("Authentication failed"));
        }
      } else if (response.id === 2) {
        clearTimeout(timeout);
        ws.close();
        response.error ? reject(new Error(response.error.message)) : resolve(response.result);
      }
    });

    ws.on("error", (err) => {
      clearTimeout(timeout);
      ws.close();
      reject(err);
    });
  });
}

export default async function truenasProxyHandler(req, res) {
  const { group, service, endpoint: method, index } = req.query;

  if (group && service) {
    const widget = await getServiceWidget(group, service, index);
    const api = widgets?.[widget.type]?.api;

    if (!api) {
      return res.status(403).json({ error: "Service does not support API calls" });
    }

    if (!widget.key && !(widget.username && widget.password)) {
      return res.status(403).json({ error: "API key or username/password required" });
    }

    const mappingEntry = Object.entries(widgets?.[widget.type]?.mappings).find(
      ([, value]) => value.endpoint === method,
    );

    if (!mappingEntry) {
      return res.status(403).json({ error: "Invalid endpoint" });
    }

    const params = mappingEntry[1]?.params ?? null;

    if (widget) {
      const url = formatApiCall(api, { ...widget });

      try {
        const result = await sendTruenasWsRequest(url, method, params, widget);
        return res.status(200).json(result);
      } catch (e) {
        logger.warn("Error calling TrueNAS WebSocket API: %s. %s", url, e.message);
        return res.status(500).json({ error: { message: e.message } });
      }
    }
  }

  logger.debug("Invalid or missing proxy service type '%s' in group '%s'", service, group);
  return res.status(400).json({ error: "Invalid proxy service type" });
}
