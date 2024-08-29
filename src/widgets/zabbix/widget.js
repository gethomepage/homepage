import jsonrpcProxyHandler from "utils/proxy/handlers/jsonrpc";

const widget = {
  api: "{url}/api_jsonrpc.php",
  proxyHandler: jsonrpcProxyHandler,

  mappings: {
    trigger: { endpoint: "trigger.get" },
  },
};

export default widget;
