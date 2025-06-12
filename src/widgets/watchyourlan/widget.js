import genericProxyHandler from "utils/proxy/handlers/generic";

const widget = {
  api: "{url}/{endpoint}",
  proxyHandler: genericProxyHandler,
  mappings: {
    info: {
      endpoint: "api/status/",
    },
  },
};

export default widget;