import credentialedProxyHandler from "utils/proxy/handlers/credentialed";

const widget = {
  api: "{url}/api/{endpoint}",
  proxyHandler: credentialedProxyHandler,

  mappings: {
    statisticsv1: {
      endpoint: "groups/statistics",
    },
    statisticsv2: {
      endpoint: "households/statistics",
    },
  },
};

export default widget;
