import genericProxyHandler from "utils/proxy/handlers/generic";

const widget = {
  api: "{url}/{endpoint}",
  proxyHandler: genericProxyHandler,

  mappings: {
    "lineup.json": {
      endpoint: "lineup.json",
    }
  },
};

export default widget;
