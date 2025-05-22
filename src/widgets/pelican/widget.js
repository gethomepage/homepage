import credentialedProxyHandler from "utils/proxy/handlers/credentialed";

const widget = {
  api: "{url}/api/application/{endpoint}",
  proxyHandler: credentialedProxyHandler,

  mappings: {
    nodes: {
      endpoint: "nodes",
      validate: ["data"],
    },
    servers: {
      endpoint: "servers",
      validate: ["data"],
    },
  },
};

export default widget;
