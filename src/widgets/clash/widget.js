import credentialedProxyHandler from "utils/proxy/handlers/credentialed";

const widget = {
  api: "{url}/{endpoint}",
  proxyHandler: credentialedProxyHandler,

  mappings: {
    configs: {
      endpoint: "configs",
      validate: ["mode"],
    },
    proxies: {
      endpoint: "proxies",
      validate: ["proxies"],
    },
    connections: {
      endpoint: "connections",
      validate: ["connections"],
    },
    version: {
      endpoint: "version",
      validate: ["version"],
    },
  },
};

export default widget;
