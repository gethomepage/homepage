import nextpvrProxyHandler from "./proxy";

const widget = {
  api: "{url}/service?method={endpoint}",
  proxyHandler: nextpvrProxyHandler,

  mappings: {
    unified: {
      endpoint: "/",
    },
  },
};

export default widget;
