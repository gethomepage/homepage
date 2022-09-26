import credentialedProxyHandler from "utils/proxy/handlers/credentialed";

const widget = {
  api: "{url}/{endpoint}",
  proxyHandler: credentialedProxyHandler,

  mappings: {
    application: {
      endpoint: "application",
    },
    client: {
      endpoint: "client",
    },
    message: {
      endpoint: "message",
    },
  },
};

export default widget;
