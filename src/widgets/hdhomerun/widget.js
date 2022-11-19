import genericProxyHandler from "utils/proxy/handlers/generic";

const widget = {
  api: "{url}/{endpoint}",
  proxyHandler: genericProxyHandler,

  mappings: {
    "lineup": {
      endpoint: "lineup.json",
    }
  },
};

export default widget;
