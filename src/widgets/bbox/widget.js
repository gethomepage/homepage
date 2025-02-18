import bboxProxyHandler from "./proxy";

const widget = {
  api: "{url}/api/v1/{endpoint}",
  proxyHandler: bboxProxyHandler,

  mappings: {
    info: {
      endpoint: "/",
    },
  },
};

export default widget;
