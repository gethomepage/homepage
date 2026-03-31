import credentialedProxyHandler from "utils/proxy/handlers/credentialed";

const widget = {
  api: "{url}/api/system/{endpoint}",
  proxyHandler: credentialedProxyHandler,

  mappings: {
    stats: {
      endpoint: "stats",
    },
    "stats/bandwidth": {
      endpoint: "stats/bandwidth",
    },
  },
};

export default widget;
