import leafwikiProxyHandler from "./proxy";

const widget = {
  api: "{url}/api/{endpoint}",
  proxyHandler: leafwikiProxyHandler,

  mappings: {
    tree: {
      endpoint: "tree",
    },
  },
};

export default widget;
