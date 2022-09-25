import genericProxyHandler from "utils/proxies/generic";

const widget = {
  api: "{url}/api/v1/{endpoint}",
  proxyHandler: genericProxyHandler,

  mappings: {
    indexer: {
      endpoint: "indexer",
    },
    indexerstats: {
      endpoint: "indexerstats",
    },
  },
};

export default widget;
