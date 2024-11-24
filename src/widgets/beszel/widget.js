import beszelProxyHandler from "./proxy";

const widget = {
  api: "{url}/api/{endpoint}",
  proxyHandler: beszelProxyHandler,

  mappings: {
    systems: {
      endpoint: "collections/systems/records?page=1&perPage=500&sort=%2Bcreated",
    },
  },
};

export default widget;
