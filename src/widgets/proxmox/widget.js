import credentialedProxyHandler from "utils/proxy/handlers/credentialed";

const widget = {
  api: "{url}/api2/json/{endpoint}",
  proxyHandler: credentialedProxyHandler,
  providerOverrides: ["username", "password"],

  mappings: {
    "cluster/resources": {
      endpoint: "cluster/resources",
    },
  },
};

export default widget;
