import genericProxyHandler from "utils/proxy/handlers/generic";

const widget = {
  api: "{url}/admin/api.php?{endpoint}&auth={key}",
  proxyHandler: genericProxyHandler,

  mappings: {
    "summaryRaw": {
      endpoint: "summaryRaw",
      validate: [
        "dns_queries_today",
        "ads_blocked_today",
        "domains_being_blocked"
      ]
    },
  },
};

export default widget;
