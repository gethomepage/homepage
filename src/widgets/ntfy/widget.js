import credentialedProxyHandler from "utils/proxy/handlers/credentialed";

const widget = {
  api: "{url}/{endpoint}",
  proxyHandler: credentialedProxyHandler,

  mappings: {
    messages: {
      endpoint: "{topic}/json?poll=1&since=latest",
    },
  },
};

export default widget;
