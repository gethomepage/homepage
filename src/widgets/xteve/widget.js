import xteveProxyHandler from "./proxy";

const widget = {
  api: "{url}/{endpoint}",
  proxyHandler: xteveProxyHandler,

  mappings: {
    "api": {
      endpoint: "api/",
    },
  },
};

export default widget;
