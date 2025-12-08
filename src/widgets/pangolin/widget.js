import credentialedProxyHandler from "utils/proxy/handlers/credentialed";

const widget = {
  api: "{url}/v1/{endpoint}",
  proxyHandler: credentialedProxyHandler,

  mappings: {
    sites: {
      endpoint: "org/{org}/sites",
    },
    resources: {
      endpoint: "org/{org}/resources",
    },
  },
};

export default widget;
