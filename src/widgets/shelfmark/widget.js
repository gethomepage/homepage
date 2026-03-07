import shelfmarkProxyHandler from "./proxy";

const widget = {
  api: "{url}/api/{endpoint}",
  loginURL: "{url}/api/auth/login",
  proxyHandler: shelfmarkProxyHandler,
};

export default widget;
