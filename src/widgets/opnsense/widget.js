import genericProxyHandler from "utils/proxy/handlers/generic";

const widget = {
  api: "{url}/api/{endpoint}",
  proxyHandler: genericProxyHandler,
  providerOverrides: ["username", "password"],

  mappings: {
    activity: {
      endpoint: "diagnostics/activity/getActivity",
      validate: ["headers"],
    },
    interface: {
      endpoint: "diagnostics/traffic/interface",
      validate: ["interfaces"],
    },
  },
};

export default widget;
