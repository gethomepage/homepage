import credentialedProxyHandler from "utils/proxy/handlers/credentialed";

const widget = {
  api: "{url}/api/{endpoint}",
  proxyHandler: credentialedProxyHandler,

  mappings: {
    peers: {
      endpoint: "peers",
    },
    routes: {
      endpoint: "routes",
    },
  },
};

export default widget;
