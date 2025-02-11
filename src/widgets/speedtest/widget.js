import genericProxyHandler from "utils/proxy/handlers/credentialed";

const widget = {
  api: "{url}/api/{endpoint}",
  proxyHandler: genericProxyHandler,

  mappings: {
    latestv1: {
      endpoint: "speedtest/latest",
      validate: ["data"],
    },
    latestv2: {
      endpoint: "v1/results/latest",
      validate: ["data"],
    },
  },
};

export default widget;
