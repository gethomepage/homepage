import credentialedProxyHandler from "utils/proxy/handlers/credentialed";

const widget = {
  api: "{url}/api/{endpoint}",
  proxyHandler: credentialedProxyHandler,

  mappings: {
    timesheets: {
      endpoint: "timesheets",
      params: ["begin", "end", "size"],
    },
    active: {
      endpoint: "timesheets/active",
    },
  },
};

export default widget;
