import credentialedProxyHandler from "utils/proxy/handlers/credentialed";

const widget = {
  api: "{url}/v1/{endpoint}",
  proxyHandler: credentialedProxyHandler,

  mappings: {
    sites: {
      endpoint: "org/{org}/sites",
    },
    resources: {
      endpoint: "org/{org}/resources?pageSize=200",
    },
  },
};

export default widget;
