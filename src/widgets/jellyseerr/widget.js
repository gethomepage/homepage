import credentialedProxyHandler from "utils/proxy/handlers/credentialed";

const widget = {
  api: "{url}/api/v1/{endpoint}",
  proxyHandler: credentialedProxyHandler,

  mappings: {
    "request/count": {
      endpoint: "request/count",
      validate: [
        "total",
        "movie",
        "tv",
        "pending",
        "approved",
        "declined",
        "processing",
        "available"
      ]
    },
  },
};

export default widget;
