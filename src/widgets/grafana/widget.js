import genericProxyHandler from "utils/proxy/handlers/generic";

const widget = {
  api: "{url}/api/{endpoint}",
  proxyHandler: genericProxyHandler,

  mappings: {
    alerts: {
      endpoint: "alerts",
    },
    stats: {
      endpoint: "admin/stats",
      validate: [
        "dashboards"
      ]
    },
  },
};

export default widget;