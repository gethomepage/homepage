import credentialedProxyHandler from "utils/proxy/handlers/credentialed";

const widget = {
  api: "{url}/api/v1/{endpoint}",
  proxyHandler: credentialedProxyHandler,
  providerOverrides: ["key"],

  mappings: {
    "Request/count": {
      endpoint: "Request/count",
    },
  },
};

export default widget;
