import jsonrpcProxyHandler from "utils/proxy/handlers/jsonrpc";

const widget = {
  api: "{url}/jsonrpc",
  proxyHandler: jsonrpcProxyHandler,
};

export default widget;
