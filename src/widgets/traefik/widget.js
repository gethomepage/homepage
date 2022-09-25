import genericProxyHandler from "utils/proxies/generic";

const widget = {
  api: "{url}/api/{endpoint}",
  proxyHandler: genericProxyHandler,

  mappings: {
    overview: {
      endpoint: "overview",
    },
  },
};

export default widget;
