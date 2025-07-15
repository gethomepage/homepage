import credentialedProxyHandler from "utils/proxy/handlers/credentialed";

const widget = {
  api: "{url}/api/{endpoint}",
  proxyHandler: credentialedProxyHandler,

  mappings: {
    overview: {
      endpoint: "analytics/overview",
    },
    performance: {
      endpoint: "analytics/performance",
    },
    sectors: {
      endpoint: "analytics/sectors",
    },
    maemfe: {
      endpoint: "analytics/maemfe",
    },
  },
};

export default widget;