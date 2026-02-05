import tracearrProxyHandler from "./proxy";

const widget = {
  api: "{url}/api/v1/public/{endpoint}",
  proxyHandler: tracearrProxyHandler,

  mappings: {
    streams: {
      endpoint: "streams",
    },
  },
};

export default widget;
