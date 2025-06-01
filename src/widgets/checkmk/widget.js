import credentialedProxyHandler from "utils/proxy/handlers/credentialed";

const widget = {
  api: "{url}/{site}/check_mk/api/1.0/{endpoint}",
  proxyHandler: credentialedProxyHandler,

  mappings: {
    services_info: {
      endpoint: "domain-types/service/collections/all",
      params: ["columns", "query"],
    },
    hosts_info: {
      endpoint: "domain-types/host/collections/all",
      params: ["columns", "query"],
    },
  },
};

export default widget;
