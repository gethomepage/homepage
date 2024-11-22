import credentialedProxyHandler from "utils/proxy/handlers/credentialed";

const widget = {
  api: "{url}/api/v4/{endpoint}",
  proxyHandler: credentialedProxyHandler,
  mappings: {
    counts: {
      endpoint: "users/{user_id}/associations_count",
    },
  },
};

export default widget;
