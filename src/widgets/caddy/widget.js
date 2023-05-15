import genericProxyHandler from "utils/proxy/handlers/generic";

const widget = {
  api: "{url}/reverse_proxy/upstreams",
  proxyHandler: genericProxyHandler,
};

export default widget;
