import minecraftProxyHandler from "./proxy";

const widget = {
  proxyHandler: minecraftProxyHandler,
  allowedEndpoints: /status/,
};

export default widget;
