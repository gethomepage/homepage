import genericProxyHandler from "utils/proxy/handlers/generic";

const widget = {
  api: "{url}/api/{endpoint}",
  proxyHandler: genericProxyHandler,

  mappings: {
    status: {
      endpoint: "status",
      validate: ["running"],
    },
    assets: {
      endpoint: "assets/stats",
      validate: ["stats"],
    },
    missing: {
      endpoint: "assets/overview",
      validate: ["categories"],
    },
    lastRun: {
      endpoint: "runtime-history?limit=1",
      validate: ["history"],
    },
  },
};

export default widget;
