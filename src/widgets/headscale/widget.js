import credentialedProxyHandler from "utils/proxy/handlers/credentialed";

const widget = {
  api: "{url}/api/v1/{endpoint}/{nodeId}",
  proxyHandler: credentialedProxyHandler,

  mappings: {
    node: {
      endpoint: "node",
    },
  },
};

export default widget;
