import genericProxyHandler from "utils/proxy/handlers/generic";

const widget = {
  api: "{url}/admin/{endpoint}",
  proxyHandler: genericProxyHandler,

  mappings: {
    "api.php": {
      endpoint: "api.php",
      validate: [
        "dns_queries_today",
        "ads_blocked_today",
        "domains_being_blocked"
      ]
    },
  },
};

export default widget;
