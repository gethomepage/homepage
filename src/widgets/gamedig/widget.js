import gamedigProxyHandler from "./proxy";

const widget = {
  proxyHandler: gamedigProxyHandler,
  allowedEndpoints: /status/,
};

export default widget;
