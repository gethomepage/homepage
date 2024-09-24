import genericProxyHandler from "utils/proxy/handlers/generic";

const widget = {
  api: "{url}/api/{endpoint}",
  proxyHandler: genericProxyHandler,

  mappings: {
    vehicleinfo: {
      endpoint: "vehicle/info",
    },
  },
};

export default widget;
