import genericProxyHandler from "utils/proxy/handlers/generic";

const widget = {
  api: "{url}/{endpoint}?apikey={key}",
  proxyHandler: genericProxyHandler,

  mappings: {
    stats: {
      endpoint: "api/stats/overview",
    },
  },
};

export default widget;
