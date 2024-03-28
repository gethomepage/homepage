import credentialedProxyHandler from "utils/proxy/handlers/credentialed";

const widget = {
  api: "https://api.tailscale.com/api/v2/{endpoint}/{deviceid}",
  proxyHandler: credentialedProxyHandler,

  mappings: {
    device: {
      endpoint: "device",
    },
  },
};

export default widget;
