import genericProxyHandler from "utils/proxy/handlers/generic";

const widget = {
  api: "{url}/api/{endpoint}",
  proxyHandler: genericProxyHandler,

  mappings: {
    alerts: {
      endpoint: "alerts",
    },
    alertmanager: {
      endpoint: "alertmanager/grafana/api/v2/alerts",
    },
    stats: {
      endpoint: "admin/stats",
      validate: ["dashboards"],
    },
  },
};

export default widget;
