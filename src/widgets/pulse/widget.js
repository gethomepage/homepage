import credentialedProxyHandler from "utils/proxy/handlers/credentialed";

const widget = {
  api: "{url}/{endpoint}",
  proxyHandler: credentialedProxyHandler,

  mappings: {
    resources: {
      endpoint: "api/resources",
    },
    summary: {
      endpoint: "api/state/summary",
    },
  },
};

export default widget;
