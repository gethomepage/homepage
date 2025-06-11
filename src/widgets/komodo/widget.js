import komodoProxyHandler from "./proxy";

const widget = {
  api: "{url}/{endpoint}",
  proxyHandler: komodoProxyHandler,

  mappings: {
    containers: {
      endpoint: "read",
    },
  },
};

export default widget;
