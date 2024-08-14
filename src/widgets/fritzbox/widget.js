import fritzboxProxyHandler from "./proxy";

const widget = {
  proxyHandler: fritzboxProxyHandler,
  allowedEndpoints: /status/,
};

export default widget;
