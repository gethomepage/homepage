import genericProxyHandler from "utils/proxy/handlers/generic";

const widget = {
  api: "https://nodes.presearch.com/api/nodes/{endpoint}/{token}?stats=true",
  proxyHandler: genericProxyHandler,

  mappings: {
    // `/api/nodes/status`
    status: {
      endpoint: "status",
    },
  },
};

export default widget;
