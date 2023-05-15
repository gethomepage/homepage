import genericProxyHandler from "utils/proxy/handlers/generic";

const widget = {
  api: "{url}/api/3/{endpoint}",
  proxyHandler: genericProxyHandler,

  mappings: {
    mem: {
      endpoint: "mem",
    },
    temp: {
      endpoint: "sensors",
    },
  },
};

export default widget;







