import komodoProxyHandler from "./proxy";

const widget = {
  api: "{url}/{endpoint}",
  proxyHandler: komodoProxyHandler,

  mappings: {
    stacks: {
      endpoint: "read",
    },
  },
};

export default widget;
