import credentialedProxyHandler from "utils/proxy/handlers/credentialed";

const widget = {
  api: "{url}/api/v1/{endpoint}",
  proxyHandler: credentialedProxyHandler,

  mappings: {
    collections: {
      endpoint: "collections",
    },
    tags: {
      endpoint: "tags",
    },
  },
};

export default widget;
