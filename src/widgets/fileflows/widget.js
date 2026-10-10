import credentialedProxyHandler from "utils/proxy/handlers/credentialed";

const widget = {
  api: "{url}/{endpoint}",
  proxyHandler: credentialedProxyHandler,

  mappings: {
    status: {
      endpoint: "api/status",
    },
    status_v2: {
      endpoint: "webhook/fenrus",
    },
  },
};

export default widget;
