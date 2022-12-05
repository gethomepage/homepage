import omadaProxyHandler from "./proxy";

const widget = {
  api: "{url}/web/v1/{endpoint}",
  proxyHandler: omadaProxyHandler,

  mappings: {
    stats: {
      endpoint: "controller",
        params: {
          "method": "getGlobalStat",
        },
    }
  }
};

export default widget;
