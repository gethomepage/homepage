import dockhandProxyHandler from "./proxy";

const widget = {
  api: "{url}/api/{endpoint}",
  proxyHandler: dockhandProxyHandler,

  mappings: {
    "dashboard/stats": {
      endpoint: "dashboard/stats",
    },
  },
};

export default widget;
