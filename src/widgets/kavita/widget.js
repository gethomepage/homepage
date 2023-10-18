import kavitaProxyHandler from "./proxy";

const widget = {
  api: "{url}/api/{endpoint}",
  proxyHandler: kavitaProxyHandler,
  mappings: {
    info: {
      endpoint: "/",
    },
  },
};

export default widget;
