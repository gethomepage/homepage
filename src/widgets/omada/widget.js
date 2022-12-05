import omadaProxyHandler from "./proxy";

const widget = {
  api: "{url}/web/v1/{endpoint}",
  proxyHandler: omadaProxyHandler,

  mappings: {
    "ap": {
      endpoint: "controller",
      params: {
        "method": "getGridAps",
        "params": {
          "sortOrder": "asc",
          "currentPage": 1,
          "currentPageSize": 100000,
          "filters": {"status": "All"}
        }
      },
    },
    "client": {
      endpoint: "controller",
      params: {
        "method": "getGridActiveClients",
        "params": {"sortOrder": "asc", "currentPage": 1, "currentPageSize": 10, "filters": {"type": "all"}}
      }
    }
  }
};

export default widget;
