import credentialedProxyHandler from "utils/proxy/handlers/credentialed";

const widget = {
  api: "{url}/api/server-info/{endpoint}",
  proxyHandler: credentialedProxyHandler,

  mappings: {
    version: {
      endpoint: "version",
    },
    statistics: {
      endpoint: "statistics",
    },
    stats: {
      endpoint: "stats",
    },
  },
};

export default widget;
