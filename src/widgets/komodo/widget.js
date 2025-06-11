import komodoProxyHandler from "./proxy";

const widget = {
  api: "{url}/{endpoint}",
  proxyHandler: komodoProxyHandler,

  mappings: {
    containers: {
      endpoint: "containers", // api actually uses unified read endpoint
      body: {
        type: "GetDockerContainersSummary",
        params: {},
      },
    },
    stacks: {
      endpoint: "stacks", // api actually uses unified read endpoint
      body: {
        type: "GetStacksSummary",
        params: {},
      },
    },
  },
};

export default widget;
