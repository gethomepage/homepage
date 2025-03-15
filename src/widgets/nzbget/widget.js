import jsonrpcProxyHandler from "utils/proxy/handlers/jsonrpc";

const widget = {
  api: "{url}/jsonrpc",
  proxyHandler: jsonrpcProxyHandler,
  allowedEndpoints: /status/,
  providerOverrides: ["username", "password"],

  mappings: {
    status: {
      endpoint: "status",
    },
  },
};

export default widget;
