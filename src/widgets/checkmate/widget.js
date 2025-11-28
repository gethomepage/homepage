import genericProxyHandler from "utils/proxy/handlers/generic";

const widget = {
  api: "{url}/{endpoint}",
  proxyHandler: genericProxyHandler,

  mappings: {
    info: {
      endpoint: "v1/info",
    },
  },
};

export default widget;
