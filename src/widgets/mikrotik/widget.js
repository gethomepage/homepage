
import genericProxyHandler from "utils/proxy/handlers/generic";

const widget = {
  api: "{url}/rest/{endpoint}",
  proxyHandler: genericProxyHandler,

  mappings: {
    system: {
      endpoint: "system/resource",
    },
    leases: {
      endpoint: "ip/dhcp-server/lease",
    }
  },
};

export default widget;
