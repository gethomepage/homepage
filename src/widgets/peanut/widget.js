import genericProxyHandler from "utils/proxy/handlers/generic";

const widget = {
  api: "{url}/api/v1/{endpoint}/{key}",
  proxyHandler: genericProxyHandler,

  mappings: {
    devices: {
      endpoint: "devices",
    },
  },
};

export default widget;
