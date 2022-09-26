import genericProxyHandler from "utils/proxy/handlers/generic";

const widget = {
  api: "{url}/control/{endpoint}",
  proxyHandler: genericProxyHandler,

  mappings: {
    stats: {
      endpoint: "stats",
    },
  },
};

export default widget;
