import credentialedProxyHandler from "utils/proxy/handlers/credentialed";

const widget = {
  api: "{url}/{endpoint}",
  proxyHandler: credentialedProxyHandler,

  mappings: {
    stats: {
      endpoint: "stats",
    },
    events: {
      endpoint: "events",
    },
  },
};

export default widget;
