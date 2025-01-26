import credentialedProxyHandler from "utils/proxy/handlers/credentialed";

const widget = {
  api: "{url}/v1/{endpoint}",
  proxyHandler: credentialedProxyHandler,

  mappings: {
    ip: {
      endpoint: "publicip/ip",
      validate: ["public_ip", "country"],
    },
  },
};

export default widget;
