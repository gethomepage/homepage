import filebrowserProxyHandler from "./proxy";

const widget = {
  api: "{url}/api/{endpoint}",
  loginURL: "{url}/api/login",
  proxyHandler: filebrowserProxyHandler,

  mappings: {
    usage: {
      endpoint: "usage",
    },
  },
};

export default widget;
