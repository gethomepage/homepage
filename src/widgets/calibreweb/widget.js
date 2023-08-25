import calibreWebProxyHandler from "./proxy";

const widget = {
  api: "{url}/{endpoint}",
  proxyHandler: calibreWebProxyHandler,

  mappings: {
    stats: {
      endpoint: "opds/stats",
    },
  },
};

export default widget;
