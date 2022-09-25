import genericProxyHandler from "utils/proxies/generic";

const widget = {
  api: "{url}/api/{endpoint}",
  proxyHandler: genericProxyHandler,

  mappings: {
    "speedtest/latest": {
      endpoint: "speedtest/latest",
    },
  },
};

export default widget;
