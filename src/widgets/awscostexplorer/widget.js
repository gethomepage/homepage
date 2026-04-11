import awsCostExplorerProxyHandler from "./proxy";

const widget = {
  api: "{url}",
  proxyHandler: awsCostExplorerProxyHandler,

  mappings: {
    costs: {
      endpoint: "costs",
    },
  },
};

export default widget;
