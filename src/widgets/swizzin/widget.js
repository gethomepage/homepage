import genericProxyHandler from "utils/proxy/handlers/generic";

const widget = {
  api: "{url}/stats/{endpoint}",
  proxyHandler: genericProxyHandler,

  mappings: {
    ram: {
      endpoint: "ram",
    },
    disk: {
      endpoint: "disk",
    },
  },
};

export default widget;







