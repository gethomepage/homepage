import floodProxyHandler from "./proxy";

const widget = {
  proxyHandler: floodProxyHandler,

  mappings: {
    torrents: {
      endpoint: "torrents",
    },
  },
};

export default widget;
