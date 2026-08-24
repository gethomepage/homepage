import factorioProxyHandler from "./proxy";

const widget = {
  proxyHandler: factorioProxyHandler,
  allowedEndpoints: /status/,
};

export default widget;
