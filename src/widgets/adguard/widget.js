import genericProxyHandler from "utils/proxies/generic";

const widget = {
  api: "{url}/control/{endpoint}",
  proxyHandler: genericProxyHandler,

  mappings: {
    "stats": {
      endpoint: "stats",
    },
  },
};

export default widget;
