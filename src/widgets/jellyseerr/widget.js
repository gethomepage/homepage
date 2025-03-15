import credentialedProxyHandler from "utils/proxy/handlers/credentialed";

const widget = {
  api: "{url}/api/v1/{endpoint}",
  proxyHandler: credentialedProxyHandler,
  providerOverrides: ["key"],

  mappings: {
    "request/count": {
      endpoint: "request/count",
      validate: ["pending", "approved", "available"],
    },
  },
};

export default widget;
