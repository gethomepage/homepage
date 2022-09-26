import genericProxyHandler from "utils/proxy/handlers/generic";

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
