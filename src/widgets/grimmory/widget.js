import grimmoryProxyHandler from "./proxy";

const widget = {
  api: "{url}/api/v1/{endpoint}",
  proxyHandler: grimmoryProxyHandler,
};

export default widget;
