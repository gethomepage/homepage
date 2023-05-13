
import genericProxyHandler from "utils/proxy/handlers/generic";

const widget = {
  api: "{url}/api/v1/{endpoint}",
  proxyHandler: genericProxyHandler,
  
  mappings: {
    system: {
      endpoint: "status/system",
      validate: [
        "data"
      ]
    },
    interface: {
      endpoint: "status/interface",
      validate: [
        "data"
      ]
    }
  },
};

export default widget;
