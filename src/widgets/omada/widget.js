import credentialedProxyHandler from "../../utils/proxy/handlers/credentialed";

const widget = {
  api: "{url}/web/v1/{endpoint}",
  proxyHandler: credentialedProxyHandler,

  mappings: {
    "controller": {
      endpoint: "controller",
      params: [ "method": "getGridAps",
  "params": {
  "sortOrder": "asc",
    "currentPage": 1,
    "currentPageSize": 100000,
  "filters": {"status": "All"}
}]
    },
  },
};

export default widget;
