import genericProxyHandler from "utils/proxy/handlers/generic";

const widget = {
  api: "{url}/api/{endpoint}",
  proxyHandler: genericProxyHandler,

  mappings: {
    "inbox": {
      endpoint: "documents/",
      params: ["format", "query", "fields"],
      validate: [
        "count"
      ]
    },
    "documents": {
      endpoint: "documents/",
      params: ["format", "fields"],
      validate: [
        "count"
      ]
    },
  },
};

export default widget;
