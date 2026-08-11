import genericProxyHandler from "utils/proxy/handlers/generic";

const widget = {
  api: "{url}/rest/{endpoint}",
  proxyHandler: genericProxyHandler,

  mappings: {
    system: {
      endpoint: "system/resource",
      validate: ["cpu-load", "free-memory", "total-memory", "uptime"],
    },
    leases: {
      endpoint: "ip/dhcp-server/lease?.proplist=address",
    },
    health: {
      endpoint: "system/health",
    },
    sfp: {
      endpoint: "interface/ethernet?.proplist=sfp-temperature",
    },
  },
};

export default widget;
