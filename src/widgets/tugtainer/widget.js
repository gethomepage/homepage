import genericProxyHandler from "utils/proxy/handlers/generic";

const widget = {
  api: "{url}/api/public/{endpoint}",
  proxyHandler: genericProxyHandler,

  mappings: {
    summary: {
      endpoint: "summary",
    },
    update_count: {
      endpoint: "update_count",
    },
  },
};

export default widget;
