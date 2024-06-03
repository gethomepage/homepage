import qnapProxyHandler from "./proxy";

const widget = {
  api: "{url}",
  proxyHandler: qnapProxyHandler,
  allowedEndpoints: /status/,
};

export default widget;
