import watchtowerProxyHandler from "./proxy";

const widget = {
  api: "{url}/{endpoint}",
  proxyHandler: watchtowerProxyHandler,

  mappings: {
    "watchtower": {
      endpoint: "v1/metrics",
    },
  },
};

export default widget;