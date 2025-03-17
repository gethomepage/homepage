import jsonrpcProxyHandler from "utils/proxy/handlers/jsonrpc";

const widget = {
  api: "{url}",
  proxyHandler: jsonrpcProxyHandler,
  allowedEndpoints: /^(getblockchaininfo|getnetworkinfo)$/,

  mappings: {
    blockchainInfo: {
      endpoint: "getblockchaininfo",
      params: [],
    },
    networkInfo: {
      endpoint: "getnetworkinfo",
      params: [],
    },
  },
};

export default widget;
