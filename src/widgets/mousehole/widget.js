import genericProxyHandler from "utils/proxy/handlers/generic";

const widget = {
  api: "{url}/{endpoint}",
  proxyHandler: genericProxyHandler,

  mappings: {
    state: {
      endpoint: "state",
    },
  },
};

export default widget;
