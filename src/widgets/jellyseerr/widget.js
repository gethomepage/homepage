import credentialedProxyHandler from "utils/proxy/handlers/credentialed";

const widget = {
  api: "{url}/api/v1/{endpoint}",
  proxyHandler: credentialedProxyHandler,

  mappings: {
    "request/count": {
      endpoint: "request/count",
      validate: ["pending", "approved", "available"],
    },
    "issue/count": {
      endpoint: "issue/count",
      validate: ["open", "total"],
    },
  },
};

export default widget;
