import genericProxyHandler from "utils/proxies/generic";

const widget = {
  api: "{url}/admin/{endpoint}",
  proxyHandler: genericProxyHandler,

  mappings: {
    "api.php": {
      endpoint: "api.php",
    },
  },
};

export default widget;
