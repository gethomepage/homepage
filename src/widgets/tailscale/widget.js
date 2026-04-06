import credentialedProxyHandler from "utils/proxy/handlers/credentialed";
import { asJson } from "utils/proxy/api-helpers";

const widget = {
  api: "https://api.tailscale.com/api/v2/{endpoint}",
  proxyHandler: credentialedProxyHandler,

  mappings: {
    device: {
      endpoint: "device/{deviceid}",
    },
    devices: {
      endpoint: "tailnet/{tailnet}/devices?fields=all",
      map: (data) => asJson(data).devices,
    },
  },
};

export default widget;
