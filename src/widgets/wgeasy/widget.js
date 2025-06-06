import credentialedProxyHandler from "utils/proxy/handlers/credentialed";

const widget = {
  api: "{url}/api/{endpoint}",
  proxyHandler: credentialedProxyHandler,

  mappings: {
    client: {
      endpoint: "wireguard/client",
    },
    clientv2: {
      endpoint: "client",
    },
  },
};

export default widget;
