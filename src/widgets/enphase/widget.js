import enphaseProxyHandler from "./proxy";

const widget = {
  api: "{url}/production.json",
  proxyHandler: enphaseProxyHandler,
  allowedEndpoints: /^production$/,
};

export default widget;
