import genericProxyHandler from "utils/proxy/handlers/generic";

const widget = {
  api: "{url}/api/server/{endpoint}",
  proxyHandler: genericProxyHandler,

  mappings: {
    info: {
      endpoint: "info",
    },
  },
};

export default widget;
