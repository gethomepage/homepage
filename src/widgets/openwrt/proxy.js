import { sendJsonRpcRequest } from "utils/proxy/handlers/jsonrpc";
import { formatApiCall } from "utils/proxy/api-helpers";
import getServiceWidget from "utils/config/service-helpers";
import createLogger from "utils/logger";
import widgets from "widgets/widgets";

const PROXY_NAME = "OpenWRTProxyHandler";
const logger = createLogger(PROXY_NAME);
const LOGIN_PARAMS = ["00000000000000000000000000000000", "session", "login"];
const RPC_METHOD = "call";

let authToken = "00000000000000000000000000000000";

const PARAMS = {
  system: ["system", "info", {}],
  device: ["network.device", "status", {}],
};

async function getWidget(req) {
  const { group, service, index } = req.query;

  if (!group || !service) {
    logger.debug("Invalid or missing service '%s' or group '%s'", service, group);
    return null;
  }

  const widget = await getServiceWidget(group, service, index);

  if (!widget) {
    logger.debug("Invalid or missing widget for service '%s' in group '%s'", service, group);
    return null;
  }

  return widget;
}

function isUnauthorized(data) {
  const json = JSON.parse(data.toString());
  return json?.error?.code === -32002;
}

async function login(url, username, password) {
  const response = await sendJsonRpcRequest(url, RPC_METHOD, [...LOGIN_PARAMS, { username, password }]);

  if (response[0] === 200) {
    const responseData = JSON.parse(response[2]);
    authToken = responseData[1].ubus_rpc_session;
  }

  return response;
}

async function fetchInterface(url, interfaceName) {
  const [, contentType, data] = await sendJsonRpcRequest(url, RPC_METHOD, [authToken, ...PARAMS.device]);
  if (isUnauthorized(data)) {
    return [401, contentType, data];
  }
  const response = JSON.parse(data.toString())[1];
  const networkInterface = response[interfaceName];
  if (!networkInterface) {
    return [404, contentType, { error: "Interface not found" }];
  }

  const interfaceInfo = {
    up: networkInterface.up,
    bytesRx: networkInterface.statistics.rx_bytes,
    bytesTx: networkInterface.statistics.tx_bytes,
  };
  return [200, contentType, interfaceInfo];
}

async function fetchSystem(url) {
  const [, contentType, data] = await sendJsonRpcRequest(url, RPC_METHOD, [authToken, ...PARAMS.system]);
  if (isUnauthorized(data)) {
    return [401, contentType, data];
  }
  const systemResponse = JSON.parse(data.toString())[1];
  const response = {
    uptime: systemResponse.uptime,
    cpuLoad: (systemResponse.load[1] / 65536.0).toFixed(2),
  };
  return [200, contentType, response];
}

async function fetchData(url, widget) {
  let response;
  if (widget.interfaceName) {
    response = await fetchInterface(url, widget.interfaceName);
  } else {
    response = await fetchSystem(url);
  }
  return response;
}

export default async function proxyHandler(req, res) {
  const { group, service } = req.query;

  if (!group || !service) {
    logger.debug("Invalid or missing service '%s' or group '%s'", service, group);
    return res.status(400).json({ error: "Invalid proxy service type" });
  }

  const widget = await getWidget(req);

  if (!widget) {
    logger.debug("Invalid or missing widget for service '%s' in group '%s'", service, group);
    return res.status(400).json({ error: "Invalid proxy service type" });
  }

  const api = widgets?.[widget.type]?.api;
  const url = new URL(formatApiCall(api, { ...widget }));

  let [status, , data] = await fetchData(url, widget);

  if (status === 401) {
    const [loginStatus, , loginData] = await login(url, widget.username, widget.password);
    if (loginStatus !== 200) {
      return res.status(loginStatus).end(loginData);
    }
    [status, , data] = await fetchData(url, widget);

    if (status === 401) {
      return res.status(401).json({ error: "Unauthorized" });
    }
  }

  return res.status(200).end(JSON.stringify(data));
}
