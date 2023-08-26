import genericProxyHandler from "../../utils/proxy/handlers/generic";

const widget = {
  api: "{url}/{endpoint}",
  proxyHandler: genericProxyHandler,

  mappings: {
    stats: {
      endpoint: "opds/stats",
    },
  },
};

export default widget;
