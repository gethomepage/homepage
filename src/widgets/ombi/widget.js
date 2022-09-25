import credentialedProxyHandler from "utils/proxies/credentialed";

const widget = {
  api: "{url}/api/v1/{endpoint}",
  proxyHandler: credentialedProxyHandler,

  mappings: {
    "Request/count": {
      endpoint: "Request/count",
    },
  },
};

export default widget;
