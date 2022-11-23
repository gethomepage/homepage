import genericProxyHandler from "utils/proxy/handlers/generic";

const widget = {
  api: "{url}/api/{endpoint}",
  proxyHandler: genericProxyHandler,

  mappings: {
    summary: {
      endpoint: "summary",
      validate: [
        "data",
      ]
    },
  },
};

export default widget;
