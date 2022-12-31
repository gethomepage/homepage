import credentialedProxyHandler from "utils/proxy/handlers/credentialed";

const widget = {
  api: "https://api.nextdns.io/profiles/{profile}/{endpoint}",
  proxyHandler: credentialedProxyHandler,

  mappings: {
    "analytics/status": {
      endpoint: "analytics/status",
      validate: [
        "data",
      ]
    },
  },
};

export default widget;
