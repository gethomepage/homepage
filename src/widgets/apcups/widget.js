import apcupsProxyHandler from "./proxy";

const widget = {
  proxyHandler: apcupsProxyHandler,
  allowedEndpoints: /status/,
};

export default widget;
