import genericProxyHandler from "utils/proxy/handlers/generic";

const widget = {
  api: "{url}/rest/{endpoint}",
  proxyHandler: genericProxyHandler,

  mappings: {
    system: {
      endpoint: "system/resource",
      validate: ["cpu-load", "free-memory", "total-memory", "uptime", "version"],
    },
    leases: {
      endpoint: "ip/dhcp-server/lease?.proplist=address",
    },
    health: {
      endpoint: "system/health",
    },
  },
};

export default widget;
