import credentialedProxyHandler from "utils/proxy/handlers/credentialed";

const widget = {
  api: "{url}/php/server/devices.php?action=getDevicesTotals",
  proxyHandler: credentialedProxyHandler,

  mappings: {
    data: {
      endpoint: "data",
    },
  },
};

export default widget;
