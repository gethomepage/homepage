import genericProxyHandler from "utils/proxy/handlers/generic";

const widget = {
  api: "{url}/?stats=true",
  proxyHandler: genericProxyHandler,
};

export default widget;
