import unifiProxyHandler from "./proxy";

const widget = {
  // version 1 (default): legacy UniFi Network API
  api: "{url}{prefix}/api/{endpoint}",
  // version 2: official UniFi Network Integration API (UniFi OS / UniFi OS Server)
  apiv2: "{url}/proxy/network/integration/v1/{endpoint}",
  proxyHandler: unifiProxyHandler,

  mappings: {
    "stat/sites": {
      endpoint: "stat/sites",
    },
  },
};

export default widget;
