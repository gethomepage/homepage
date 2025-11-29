import genericProxyHandler from "utils/proxy/handlers/generic";

const widget = {
  api: "{url}/{endpoint}",
  proxyHandler: genericProxyHandler,

  mappings: {
    summary: {
      endpoint: "api/v1/summary",
    },
  },
};

export default widget;
