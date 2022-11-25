import genericProxyHandler from "utils/proxy/handlers/generic";

const widget = {
  api: "{url}/api/{endpoint}",
  proxyHandler: genericProxyHandler,

  mappings: {
    "statistics": {
      endpoint: "statistics/?format=json",
      validate: [
        "documents_total"
      ]
    },
  },
};

export default widget;
