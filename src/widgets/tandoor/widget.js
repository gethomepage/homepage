import credentialedProxyHandler from "utils/proxy/handlers/credentialed";

const widget = {
  api: "{url}/api/{endpoint}/",
  proxyHandler: credentialedProxyHandler,

  mappings: {
    space: {
      endpoint: "space",
    },
    keyword: {
      endpoint: "keyword",
    },
  },
};

export default widget;
