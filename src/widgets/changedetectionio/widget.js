import credentialedProxyHandler from "utils/proxy/handlers/credentialed";

const widget = {
  api: "{url}/api/v1/{endpoint}",
  proxyHandler: credentialedProxyHandler,

  mappings: {
    info: {
      method: "GET",
      endpoint: "watch",
    },
  },
};

export default widget;
