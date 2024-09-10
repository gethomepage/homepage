import { JSONRPCClient, JSONRPCErrorException } from "json-rpc-2.0";

import { formatApiCall } from "utils/proxy/api-helpers";
import { httpProxy } from "utils/proxy/http";
import getServiceWidget from "utils/config/service-helpers";
import createLogger from "utils/logger";
import widgets from "widgets/widgets";

const logger = createLogger("jsonrpcProxyHandler");

export async function sendJsonRpcRequest(url, method, params, widget) {
  const headers = {
    "content-type": "application/json",
    accept: "application/json",
  };

  if (widget?.username && widget?.password) {
    headers.Authorization = `Basic ${Buffer.from(`${widget.username}:${widget.password}`).toString("base64")}`;
  }

  if (widget?.key) {
    headers.Authorization = `Bearer ${widget.key}`;
  }

  const client = new JSONRPCClient(async (rpcRequest) => {
    const body = JSON.stringify(rpcRequest);
    const httpRequestParams = {
      method: "POST",
      headers,
      body,
    };

    // eslint-disable-next-line no-unused-vars
    const [status, contentType, data] = await httpProxy(url, httpRequestParams);
    if (status === 200) {
      const json = JSON.parse(data.toString());

      if (json.id === null) {
        json.id = 1;
      }

      // in order to get access to the underlying error object in the JSON response
      // you must set `result` equal to undefined
      if (json.error && json.result === null) {
        json.result = undefined;
      }
      return client.receive(json);
    }

    return Promise.reject(data?.error ? data : new Error(data.toString()));
  });

  try {
    const response = await client.request(method, params);
    return [200, "application/json", JSON.stringify(response)];
  } catch (e) {
    if (e instanceof JSONRPCErrorException) {
      logger.debug("Error calling JSONPRC endpoint: %s.  %s", url, e.message);
      return [200, "application/json", JSON.stringify({ result: null, error: { code: e.code, message: e.message } })];
    }

    logger.warn("Error calling JSONPRC endpoint: %s.  %s", url, e);
    return [500, "application/json", JSON.stringify({ result: null, error: { code: 2, message: e.toString() } })];
  }
}

export default async function jsonrpcProxyHandler(req, res) {
  const { group, service, endpoint: method } = req.query;

  if (group && service) {
    const widget = await getServiceWidget(group, service);
    const api = widgets?.[widget.type]?.api;

    const [, mapping] = Object.entries(widgets?.[widget.type]?.mappings).find(([, value]) => value.endpoint === method);
    const params = mapping?.params ?? null;

    if (!api) {
      return res.status(403).json({ error: "Service does not support API calls" });
    }

    if (widget) {
      const url = formatApiCall(api, { ...widget });

      const [status, , data] = await sendJsonRpcRequest(url, method, params, widget);
      return res.status(status).end(data);
    }
  }

  logger.debug("Invalid or missing proxy service type '%s' in group '%s'", service, group);
  return res.status(400).json({ error: "Invalid proxy service type" });
}
