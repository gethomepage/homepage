
import genericProxyHandler from "utils/proxy/handlers/generic";

const widget = {
  api: "{url}/api/{endpoint}",
  proxyHandler: genericProxyHandler,

  mappings: {
    version: {
      endpoint: "core/firmware/status",
    },
    activity: {
      endpoint: "diagnostics/activity/getActivity",
    },
    interface: {
      endpoint: "diagnostics/traffic/interface",
    }
  },
};

export default widget;
