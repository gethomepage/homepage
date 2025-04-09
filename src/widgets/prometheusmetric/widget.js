import genericProxyHandler from "utils/proxy/handlers/generic";

const widget = {
  api: "{url}/api/v1/{endpoint}",
  proxyHandler: genericProxyHandler,

  mappings: {
    query: {
      method: "GET",
      endpoint: "query",
      params: ["query"],
    },
  },
};

export default widget;
