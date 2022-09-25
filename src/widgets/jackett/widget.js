import genericProxyHandler from "utils/proxies/generic";

const widget = {
  api: "{url}/api/v2.0/{endpoint}?apikey={key}&configured=true",
  proxyHandler: genericProxyHandler,

  mappings: {
    "indexers": {
      endpoint: "indexers"
    },
  },
};

export default widget;
