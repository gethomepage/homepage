import credentialedProxyHandler from "utils/proxy/handlers/credentialed";

const widget = {
  api: "{url}/api/v1/public/{endpoint}",
  proxyHandler: credentialedProxyHandler,

  mappings: {
    streams: {
      endpoint: "streams",
    },
  },
};

export default widget;
