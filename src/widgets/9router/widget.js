import nineRouterProxyHandler from "./proxy";

const widget = {
  api: "{url}/api/{endpoint}",
  proxyHandler: nineRouterProxyHandler,

  mappings: {
    providers: {
      endpoint: "providers",
    },
    models: {
      endpoint: "models",
    },
    combos: {
      endpoint: "combos",
    },
  },
};

export default widget;
