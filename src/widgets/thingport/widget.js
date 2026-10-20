import credentialedProxyHandler from "utils/proxy/handlers/credentialed";

const widget = {
  api: "{url}/api/{endpoint}",
  proxyHandler: credentialedProxyHandler,

  mappings: {
    summary: {
      endpoint: "dashboard/summary",
    },
    recent: {
      endpoint: "prints",
      params: ["orderBy", "limit"],
    },
    viewed: {
      endpoint: "dashboard/top-viewed",
    },
    printed: {
      endpoint: "dashboard/top-printed",
    },
    featured: {
      endpoint: "dashboard/featured",
      params: ["date"],
    },
  },
};

export default widget;
