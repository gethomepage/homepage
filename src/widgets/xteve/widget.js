import xteveProxyHandler from "./proxy";

const widget = {
  api: "{url}/{endpoint}",
  proxyHandler: xteveProxyHandler,

  mappings: {
    "xteve": {
      endpoint: "api/",
    },
  },
};

export default widget;
