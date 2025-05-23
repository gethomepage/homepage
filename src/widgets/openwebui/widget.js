import credentialedProxyHandler from "utils/proxy/handlers/credentialed";

const widget = {
  api: "{url}/api/v1/{endpoint}",
  proxyHandler: credentialedProxyHandler,

  mappings: {
    users: {
      endpoint: "users/all",
    },
    models: {
      endpoint: "models/base",
    },
  },
};

export default widget;
