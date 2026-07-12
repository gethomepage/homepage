import duplicatiProxyHandler from "./proxy";

const widget = {
  api: "{url}/api/v1/{endpoint}",
  proxyHandler: duplicatiProxyHandler,
};

export default widget;
