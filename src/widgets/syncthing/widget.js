import credentialedProxyHandler from "utils/proxy/handlers/credentialed";

const widget = {
  api: "{url}/rest/{endpoint}",
  proxyHandler: credentialedProxyHandler,

  mappings: {
    connections: {
      endpoint: "system/connections",
      validate: ["connections"],
    },
    completion: {
      endpoint: "db/completion",
      validate: ["completion", "globalBytes"],
    },
    error: {
      endpoint: "system/error",
      validate: ["errors"],
    },
  },
};

export default widget;
