import credentialedProxyHandler from "utils/proxy/handlers/credentialed";

const widget = {
  api: "{url}/api/{endpoint}",
  proxyHandler: credentialedProxyHandler,

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
