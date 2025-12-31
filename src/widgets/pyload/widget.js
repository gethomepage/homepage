import pyloadProxyHandler from "./proxy";

const widget = {
  api: "{url}/api/{endpoint}",
  proxyHandler: pyloadProxyHandler,

  mappings: {
    status: {
      endpoint: "statusServer",
      map: { ngEndpoint: "status_server" },
    },
  },
};

export default widget;
