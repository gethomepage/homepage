import jsonrpcProxyHandler from "utils/proxy/handlers/jsonrpc";

const widget = {
  api: "{url}/jsonrpc",
  proxyHandler: jsonrpcProxyHandler,
  allowedEndpoints: /status/,

  mappings: {
    status: {
      endpoint: "status",
    },
  },
};

export default widget;
