import genericProxyHandler from "utils/proxy/handlers/generic";

const widget = {
  api: "{url}/api/v2.0/{endpoint}?apikey={key}&configured=true",
  proxyHandler: genericProxyHandler,

  mappings: {
    indexers: {
      endpoint: "indexers",
    },
  },
};

export default widget;
