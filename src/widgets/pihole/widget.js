import genericProxyHandler from "utils/proxy/handlers/generic";

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
