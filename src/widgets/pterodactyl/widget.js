import credentialedProxyHandler from "utils/proxy/handlers/credentialed";

const widget = {
  api: "{url}/api/application/{endpoint}",
  proxyHandler: credentialedProxyHandler,

  mappings: {
    nodes: {
      endpoint: "nodes?include=servers",
      validate: [
        "data"
      ]
    },
  },
};

export default widget;
