import genericProxyHandler from "utils/proxy/handlers/generic";

const widget = {
  api: "{url}/api/livedata/status",
  proxyHandler: genericProxyHandler,
};

export default widget;
