import credentialedProxyHandler from "utils/proxy/handlers/credentialed";

const widget = {
  api: "{url}/etapi/{endpoint}",
  proxyHandler: credentialedProxyHandler,

  mappings: {
    metrics: {
      endpoint: "metrics?format=json",
      validate: ["version", "database"],
    },
  },
};

export default widget;
