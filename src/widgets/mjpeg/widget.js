import genericProxyHandler from "utils/proxy/handlers/generic";

const widget = {
  api: "{url}/{endpoint}",
  proxyHandler: genericProxyHandler,
};

export default widget;
