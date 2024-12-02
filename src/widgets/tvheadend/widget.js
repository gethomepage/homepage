import genericProxyHandler from "utils/proxy/handlers/generic";

const widget = {
  api: "{url}/api/{endpoint}",
  proxyHandler: genericProxyHandler,

  mappings: {
    dvr: {
      endpoint: "dvr/entry/grid",
      validate: ["entries"],
    },
    subscriptions: {
      endpoint: "status/subscriptions",
      validate: ["entries"],
    },
  },
};

export default widget;
