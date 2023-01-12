import genericProxyHandler from "utils/proxy/handlers/generic";

const widget = {
  api: "{url}/printer/objects/query?{endpoint}",
  proxyHandler: genericProxyHandler,

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
