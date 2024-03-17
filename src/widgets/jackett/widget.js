import credentialedProxyHandler from "utils/proxy/handlers/credentialed";

const widget = {
  api: "{url}/api/v2.0/{endpoint}?configured=true",
  proxyHandler: credentialedProxyHandler,
  loginURL: "{url}/UI/Dashboard",

  mappings: {
    indexers: {
      endpoint: "indexers",
    },
  },
};

export default widget;
