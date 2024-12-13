import urbackupProxyHandler from "./proxy";

const widget = {
  proxyHandler: urbackupProxyHandler,
  allowedEndpoints: /status/,
};

export default widget;
