import credentialedProxyHandler from "utils/proxy/handlers/credentialed";

const widget = {
  api: "{url}/{endpoint}",
  proxyHandler: credentialedProxyHandler,

  mappings: {
    data: {
      endpoint: "php/server/devices.php?action=getDevicesTotals",
    },
    datav2: {
      endpoint: "devices/totals",
    },
  },
};

export default widget;
