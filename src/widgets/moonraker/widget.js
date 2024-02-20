import credentialedProxyHandler from "utils/proxy/handlers/credentialed";

const widget = {
  api: "{url}/printer/objects/query?{endpoint}",
  proxyHandler: credentialedProxyHandler,

  mappings: {
    print_stats: {
      endpoint: "print_stats",
    },
    display_status: {
      endpoint: "display_status",
    },
    webhooks: {
      endpoint: "webhooks",
    },
  },
};

export default widget;
