import filebrowserProxyHandler from "./proxy";

const widget = {
  api: "{url}/api/{endpoint}",
  proxyHandler: filebrowserProxyHandler,

  mappings: {
    usage: {
      endpoint: "usage",
    },
  },
};

export default widget;
