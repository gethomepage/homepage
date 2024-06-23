import credentialedProxyHandler from "utils/proxy/handlers/credentialed";

const widget = {
  api: "{url}/api/{endpoint}",
  proxyHandler: credentialedProxyHandler,

  mappings: {
    info: {
      endpoint: "speedtests?limit=1",
    },
  },
};

export default widget;
