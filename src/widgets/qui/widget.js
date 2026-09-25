import credentialedProxyHandler from "utils/proxy/handlers/credentialed";

const widget = {
  api: "{url}/api/{endpoint}",
  proxyHandler: credentialedProxyHandler,

  mappings: {
    torrents: {
      endpoint: "instances/{instance}/torrents?limit=1",
      validate: ["stats"],
    },
    torrentsAll: {
      endpoint: "torrents/cross-instance?limit=1",
      validate: ["stats"],
    },
  },
};

export default widget;
