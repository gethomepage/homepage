import npmProxyHandler from "./proxy";

const widget = {
  api: "{url}/api/{endpoint}",
  proxyHandler: npmProxyHandler,
};

export default widget;
