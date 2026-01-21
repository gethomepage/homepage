import dockhandProxyHandler from "./proxy";

const widget = {
  api: "{url}/api/dashboard/stats?env={env}",
  proxyHandler: dockhandProxyHandler,
};

export default widget;
