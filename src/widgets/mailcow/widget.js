import credentialedProxyHandler from "../../utils/proxy/handlers/credentialed";

const widget = {
  api: "{url}/api/v1/get/{endpoint}",
  proxyHandler: credentialedProxyHandler,

  mappings: {
    domains: {
      endpoint: "domain/all",
    },
  },
};

export default widget;
