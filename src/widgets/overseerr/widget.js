import credentialedProxyHandler from "utils/proxies/credentialed";

const widget = {
  api: "{url}/api/v1/{endpoint}",
  proxyHandler: credentialedProxyHandler,

  mappings: {
    "request/count": {
      endpoint: "request/count",
    },
  },
};

export default widget;
