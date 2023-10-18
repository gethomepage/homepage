import genericProxyHandler from "utils/proxy/handlers/generic";

const widget = {
  api: "{url}/php/server/devices.php?action=getDevicesTotals",
  proxyHandler: genericProxyHandler,

  mappings: {
    data: {
      endpoint: "data",
    },
  },
};

export default widget;
