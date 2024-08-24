import credentialedProxyHandler from "utils/proxy/handlers/credentialed";

const widget = {
  api: "{url}/api/{endpoint}",
  proxyHandler: credentialedProxyHandler,

  mappings: {
    version: {
      endpoint: "app/about",
    },
    groups: {
      endpoint: "groups/statistics",
    },
    households: {
      endpoint: "households/statistics",
    },
  },
};

export default widget;
