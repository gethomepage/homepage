import genericProxyHandler from "utils/proxy/handlers/generic";

const widget = {
  api: "{url}/api/{endpoint}",
  proxyHandler: genericProxyHandler,
  headers: {
    "X-Requested-By": "homepage",
    Accept: "application/json",
  },
  mappings: {
    count: {
      endpoint: "search/universal/relative",
      params: ["query", "limit"],
      optionalParams: ["range"],
      validate: ["total_results"],
    },
    throughput: {
      endpoint: "system/metrics/namespace/org.graylog2.throughput",
      validate: ["metrics"],
    },
    notifications: {
      endpoint: "system/notifications",
      validate: ["total"],
    },
  },
};

export default widget;
