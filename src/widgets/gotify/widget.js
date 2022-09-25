import credentialedProxyHandler from "utils/proxies/credentialed";

const widget = {
  api: "{url}/{endpoint}",
  proxyHandler: credentialedProxyHandler,

  mappings: {
    "application": {
      endpoint: "application"
    },
    "client": {
      endpoint: "client"
    },
    "message": {
      endpoint: "message"
    },
  },
};

export default widget;
