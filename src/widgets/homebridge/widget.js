import homebridgeProxyHandler from "./proxy";

const widget = {
  api: "{url}/api/{endpoint}",
  proxyHandler: homebridgeProxyHandler,

  mappings: {
    info: {
      endpoint: "/",
    }
  },
};

export default widget;
