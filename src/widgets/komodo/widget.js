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
    servers: {
      endpoint: "servers", // api actually uses unified read endpoint
      body: {
        type: "GetServersSummary",
        params: {},
      },
    },
  },
};

export default widget;
