import genericProxyHandler from "utils/proxy/handlers/generic";

const widget = {
  api: "{url}/{endpoint}",
  proxyHandler: genericProxyHandler,

  mappings: {
    api: {
      endpoint: "api/v1/sources",
    },
  },
};

export default widget;