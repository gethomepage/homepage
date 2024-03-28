import genericProxyHandler from "utils/proxy/handlers/generic";

const widget = {
  api: "{url}/api/v1/{endpoint}?apikey={key}",
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
