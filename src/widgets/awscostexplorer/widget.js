import awsCostExplorerProxyHandler from "./proxy";

const widget = {
  // `api` is required by the widget shape validator but unused at runtime;
  // this proxy calls the AWS SDK directly rather than via formatApiCall.
  api: "{url}",
  proxyHandler: awsCostExplorerProxyHandler,

  mappings: {
    costs: {
      endpoint: "costs",
    },
  },
};

export default widget;
