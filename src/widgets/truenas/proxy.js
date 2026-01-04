import WebSocket from "ws";

import getServiceWidget from "utils/config/service-helpers";
import createLogger from "utils/logger";
import { sanitizeErrorURL } from "utils/proxy/api-helpers";
import credentialedProxyHandler from "utils/proxy/handlers/credentialed";
import validateWidgetData from "utils/proxy/validate-widget-data";
import widgets from "widgets/widgets";

const logger = createLogger("truenasProxyHandler");

function buildWebsocketUrl(baseUrl) {
  const url = new URL(baseUrl);
  const pathname = url.pathname.replace(/\/$/, "");
  url.protocol = url.protocol === "https:" ? "wss:" : "ws:";
  url.pathname = `${pathname}/websocket`;
  url.search = "";
  url.hash = "";
  return url.toString();
}

function waitForEvent(ws, handler, { event = "message", parseJson = true } = {}) {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      cleanup();
      reject(new Error("TrueNAS websocket wait timed out"));
    }, 10000);

    const handleEvent = (payload) => {
      try {
        const parsed = parseJson ? JSON.parse(payload.toString()) : payload;
        if (parseJson) logger.info("Received TrueNAS websocket message: %o", parsed);
        const handlerResult = handler(parsed);
        if (handlerResult !== undefined) {
          cleanup();
          if (handlerResult instanceof Error) {
            reject(handlerResult);
          } else {
            resolve(handlerResult);
          }
        }
      } catch (err) {
        cleanup();
        reject(err);
      }
    };

    const handleError = (err) => {
      cleanup();
      logger.error("TrueNAS websocket error: %s", err?.message ?? err);
      reject(err);
    };

    const handleClose = () => {
      cleanup();
      logger.error("TrueNAS websocket connection closed unexpectedly");
      reject(new Error("TrueNAS websocket closed the connection"));
    };

    function cleanup() {
      clearTimeout(timeout);
      ws.off(event, handleEvent);
      ws.off("error", handleError);
      ws.off("close", handleClose);
    }

    ws.on(event, handleEvent);
    ws.on("error", handleError);
    ws.on("close", handleClose);
  });
}

async function ensureConnected(ws) {
  ws.send(JSON.stringify({ msg: "connect", version: "1", support: ["1"] }));
  await waitForEvent(ws, (message) => (message?.msg === "connected" ? true : undefined));
}

let nextId = 1;
async function sendMethod(ws, method, params = []) {
  const id = nextId++;
  logger.info("Sending TrueNAS websocket method %s with id %d", method, id);
  ws.send(JSON.stringify({ id, msg: "method", method, params }));

  return waitForEvent(ws, (message) => {
    if (message?.msg === "result" && message.id === id) {
      if (message.error) {
        return new Error(message.error.reason || JSON.stringify(message.error));
      }
      return message.result;
    }
    if (message?.msg === "error" && message.id === id) {
      return new Error(message.error || "Unknown websocket error");
    }
    return undefined;
  });
}

async function authenticate(ws, widget) {
  if (widget?.key) {
    try {
      const apiKeyResult = await sendMethod(ws, "auth.login_with_api_key", [widget.key]);
      if (apiKeyResult === true) return;
      logger.warn("TrueNAS API key authentication failed, falling back to username/password when available.");
    } catch (err) {
      logger.warn("TrueNAS API key authentication failed: %s", err?.message ?? err);
    }
  }

  if (widget?.username && widget?.password) {
    const loginResult = await sendMethod(ws, "auth.login", [widget.username, widget.password]);
    if (loginResult === true) return;
    logger.warn("TrueNAS username/password authentication failed.");
  }

  throw new Error("TrueNAS authentication failed");
}

async function callWebsocket(widget, method) {
  const wsUrl = buildWebsocketUrl(widget.url);
  logger.info("Connecting to TrueNAS websocket at %s", wsUrl);
  const ws = new WebSocket(wsUrl, { rejectUnauthorized: false });

  await waitForEvent(ws, () => true, { event: "open", parseJson: false });
  logger.info("Connected to TrueNAS websocket at %s", wsUrl);
  try {
    await ensureConnected(ws);
    await authenticate(ws, widget);
    const result = await sendMethod(ws, method);
    return result;
  } finally {
    ws.close();
  }
}

export default async function truenasProxyHandler(req, res, map) {
  const { group, service, endpoint, index } = req.query;

  try {
    if (!endpoint) {
      return res.status(204).end();
    }

    const widget = await getServiceWidget(group, service, index);
    const widgetVersion = Number(widget?.version ?? 1);

    if (Number.isNaN(widgetVersion) || widgetVersion < 2) {
      // Use legacy REST proxy for version 1
      return credentialedProxyHandler(req, res, map);
    }

    const widgetDefinition = widgets?.[widget.type];
    const mappingEntry = Object.values(widgetDefinition?.mappings ?? {}).find(
      (mapping) => mapping.endpoint === endpoint,
    );
    const wsMethod = mappingEntry?.wsMethod;

    if (!wsMethod) {
      logger.debug("Missing wsMethod mapping for TrueNAS endpoint %s", endpoint);
      return res.status(500).json({ error: "Missing wsMethod mapping." });
    }

    try {
      let data = await callWebsocket(widget, wsMethod);

      if (!validateWidgetData(widget, endpoint, data)) {
        return res.status(500).json({ error: { message: "Invalid data", url: sanitizeErrorURL(widget.url), data } });
      }

      if (map) data = map(data);

      return res.status(200).json(data);
    } catch (err) {
      if (err?.status) {
        return res.status(err.status).json({ error: err.message });
      }
      logger.warn("Websocket call for TrueNAS failed: %s", err?.message ?? err);
    }
  } catch (err) {
    logger.error(err);
    return res.status(500).json({ error: err?.message ?? "Unexpected TrueNAS error" });
  }
}
