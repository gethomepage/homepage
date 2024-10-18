import credentialedProxyHandler from "utils/proxy/handlers/credentialed";

const widget = {
  api: "{url}/api/{endpoint}",
  proxyHandler: credentialedProxyHandler,

  mappings: {
    version: {
      endpoint: "server-info/version",
    },
    statistics: {
      endpoint: "server-info/statistics",
    },
    stats: {
      endpoint: "server-info/stats",
    },
    version_v2: {
      endpoint: "server/version",
    },
    statistics_v2: {
      endpoint: "server/statistics",
    },
  },
};

export default widget;
