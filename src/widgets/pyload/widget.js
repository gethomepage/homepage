import pyloadProxyHandler from "./proxy";

const widget = {
  api: "{url}/api/{endpoint}",
  proxyHandler: pyloadProxyHandler,

  mappings: {
    "status": {
      endpoint: "statusServer",
    }
  }
}

export default widget;
