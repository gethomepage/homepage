import credentialedProxyHandler from "utils/proxy/handlers/credentialed";

const widget = {
  api: "{url}/{endpoint}",
  proxyHandler: credentialedProxyHandler,

  mappings: {
    containers: {
      endpoint: "api/containers",
    },
  },
};

export default widget;
