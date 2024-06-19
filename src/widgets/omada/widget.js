import omadaProxyHandler from "./proxy";

const widget = {
  proxyHandler: omadaProxyHandler,

  mappings: {
    info: {
      endpoint: "api/info",
    },
  },
};

export default widget;
