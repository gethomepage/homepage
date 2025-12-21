import WebSocket from "ws";

import getServiceWidget from "utils/config/service-helpers";
import createLogger from "utils/logger";
import widgets from "widgets/widgets";

const logger = createLogger("jsonrpcWsProxyHandler");

/**
 * Builds the WebSocket URL for TrueNAS API connection
 * Converts http/https URLs to ws/wss and appends the JSON-RPC endpoint
 * 
 * @param {Object} widget - Widget configuration containing the base URL
 * @returns {string} WebSocket URL (e.g., wss://truenas-host/api/current)
 */
function buildWsUrl(widget) {
  // http://host -> ws://host
  // https://host -> wss://host
  const base = widget.url.replace(/^http/, "ws");
  return `${base}/api/current`;
}

/**
 * Returns default parameters for JSON-RPC method calls
 * TrueNAS "query" methods typically expect [filters, options] format
 * 
 * @param {string} method - The JSON-RPC method name
 * @returns {Array} Default parameters array for the method
 */
function defaultParamsForMethod(method) {
  // TrueNAS "query" style calls typically want [filters, options]
  if (typeof method === "string" && method.endsWith(".query")) {
    return [[], {}];
  }
  // Most other calls take no params
  return [];
}

/**
 * Unwraps WebSocket message data from various container formats
 * Handles Browser MessageEvent format and Node.js Buffer format
 * 
 * @param {*} data - Raw WebSocket message data
 * @returns {*} Unwrapped data
 */
function unwrapWsMessage(data) {
  // Browser-style MessageEvent: { data: ... }
  if (data && typeof data === "object" && "data" in data) return data.data;

  // Buffer JSON shape: { type: "Buffer", data: [...] }
  if (data && typeof data === "object" && data.type === "Buffer" && Array.isArray(data.data)) {
    return Buffer.from(data.data);
  }

  return data;
}

/**
 * Converts WebSocket message data to UTF-8 text string
 * Handles various data formats: strings, Buffers, ArrayBuffers, TypedArrays
 * 
 * @param {*} data - WebSocket message data
 * @returns {string} UTF-8 text representation
 */
function wsDataToText(data) {
  const d = unwrapWsMessage(data);

  if (d == null) return "";
  if (typeof d === "string") return d;
  if (Buffer.isBuffer(d)) return d.toString("utf8");

  if (d instanceof ArrayBuffer) return Buffer.from(d).toString("utf8");
  if (ArrayBuffer.isView(d)) return Buffer.from(d.buffer).toString("utf8");

  if (Array.isArray(d)) {
    try {
      return Buffer.concat(
        d.map((x) => {
          if (Buffer.isBuffer(x)) return x;
          if (x instanceof ArrayBuffer) return Buffer.from(x);
          if (ArrayBuffer.isView(x)) return Buffer.from(x.buffer);
          return Buffer.from(String(x));
        })
      ).toString("utf8");
    } catch {
      return String(d);
    }
  }

  // last resort
  return String(d);
}

/**
 * Sends a JSON-RPC request over WebSocket to TrueNAS
 * Handles authentication (API key or username/password) and method invocation
 * 
 * @param {Object} widget - Widget configuration with credentials
 * @param {string} method - JSON-RPC method to call (e.g., "pool.query")
 * @param {Array} params - Optional parameters for the method call
 * @returns {Promise} Resolves with the result or rejects with an error
 */
async function sendJsonRpcWsRequest(widget, method, params) {
  const url = buildWsUrl(widget);

  return new Promise((resolve, reject) => {
    const ws = new WebSocket(url, { rejectUnauthorized: false });

    const timeoutMs = 8000;
    const timer = setTimeout(() => {
      reject(new Error(`TrueNAS WS timeout waiting for JSON-RPC response: ${method}`));
      try {
        ws.close();
      } catch {}
    }, timeoutMs);

    // JSON-RPC message IDs to track request/response pairs
    const loginId = 1;
    const callId = 2;

    // Build authentication payload based on available credentials
    const loginPayload = widget.key
      ? {
          jsonrpc: "2.0",
          id: loginId,
          method: "auth.login_with_api_key",
          params: [widget.key],
        }
      : {
          jsonrpc: "2.0",
          id: loginId,
          method: "auth.login",
          params: [widget.username, widget.password],
        };

    // Build the actual API method call payload
    const callPayload = {
      jsonrpc: "2.0",
      id: callId,
      method,
      params: params ?? defaultParamsForMethod(method),
    };

    /**
     * Cleanup function to clear timeout and close WebSocket
     */
    const finish = (fn, value) => {
      clearTimeout(timer);
      try {
        ws.close();
      } catch {}
      fn(value);
    };

    ws.on("open", () => {
      // Send authentication request first
      ws.send(JSON.stringify(loginPayload));
      // Do NOT send the actual call until we know login succeeded
    });

    ws.on("message", (data) => {
      const text = wsDataToText(data);

      let msg;
      try {
        msg = JSON.parse(text);
      } catch (e) {
        logger.error(
          "TrueNAS WS parse failed method=%s error=%s preview=%s",
          method,
          e.message,
          text.slice(0, 100)
        );
        return finish(reject, new Error(`JSON parse failed: ${e.message}`));
      }

      // Handle authentication response
      if (msg?.id === loginId) {
        if (msg.error) {
          logger.error("TrueNAS WS login failed for method=%s, error=%s", method, JSON.stringify(msg.error));
          return finish(reject, new Error(`Login failed: ${JSON.stringify(msg.error)}`));
        }
        if (msg.result === true) {
          // Login successful, now send the actual API call
          ws.send(JSON.stringify(callPayload));
        }
        return;
      }

      // Handle API method call response
      if (msg?.id === callId) {
        if (msg.error) {
          logger.error("TrueNAS WS call failed for method=%s, error=%s", method, JSON.stringify(msg.error));
          return finish(reject, new Error(`RPC error: ${JSON.stringify(msg.error)}`));
        }
        // Success - return the result
        return finish(resolve, msg.result);
      }
    });

    ws.on("error", (err) => finish(reject, err));
  });
}

/**
 * Proxy handler for TrueNAS JSON-RPC over WebSocket requests
 * This is the main entry point called by the TrueNAS widget
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} map - Optional mapping function to transform the result
 */
export default async function jsonrpcWsProxyHandler(req, res, map) {
  const { group, service, endpoint: method, index } = req.query;

  if (!group || !service) {
    return res.status(400).json({ error: "Invalid request" });
  }

  const widget = await getServiceWidget(group, service, index);
  const api = widgets?.[widget.type]?.api;

  if (!api) {
    return res.status(403).json({ error: "Service does not support API calls" });
  }

  try {
    // Execute the JSON-RPC WebSocket request
    const result = await sendJsonRpcWsRequest(widget, method, null);

    // Apply mapping function if provided to transform result into widget-expected format
    let mapped;
    try {
      mapped = map instanceof Function ? map(result) : result;
    } catch (mapError) {
      logger.error("TrueNAS WS mapping error (%s): %s", method, mapError.message);
      throw new Error(`Mapping failed: ${mapError.message}`);
    }

    return res.status(200).json(mapped);
  } catch (err) {
    logger.error("TrueNAS WS JSON-RPC error (%s): %s", method, err?.message || err);
    // Properly serialize the error for JSON response
    return res.status(500).json({
      error: {
        message: err?.message || String(err),
        ...(err?.code && { code: err.code })
      }
    });
  }
}