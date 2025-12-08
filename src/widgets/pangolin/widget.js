import pangolinProxyHandler from "./proxy";

const widget = {
  api: "{url}/v1/{endpoint}",
  proxyHandler: pangolinProxyHandler,

  mappings: {
    stats: {
      endpoint: "/",
    },
  },
};

export default widget;
