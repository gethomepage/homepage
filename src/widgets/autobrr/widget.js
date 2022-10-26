import credentialedProxyHandler from "utils/proxy/handlers/credentialed";

const widget = {
  api: "{url}/api/{endpoint}",
  proxyHandler: credentialedProxyHandler,

  mappings: {
    stats: {
      endpoint: "release/stats",
      validate: [
        "push_approved_count",
        "push_rejected_count"
      ]
    },
    filters: {
      endpoint: "filters",
    },
    indexers: {
      endpoint: "release/indexers",
    },
  },
};

export default widget;
