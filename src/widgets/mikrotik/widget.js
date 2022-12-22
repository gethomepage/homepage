
import genericProxyHandler from "utils/proxy/handlers/generic";

const widget = {
  api: "{url}/rest/{endpoint}",
  proxyHandler: genericProxyHandler,

  mappings: {
    system: {
      endpoint: "system/resource",
    },
  },
};

export default widget;
