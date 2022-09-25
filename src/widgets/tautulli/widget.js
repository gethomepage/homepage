import genericProxyHandler from "utils/proxies/generic";

const widget = {
  api: "{url}/api/v2?apikey={key}&cmd={endpoint}",
  proxyHandler: genericProxyHandler,

  mappings: {
    get_activity: {
      endpoint: "get_activity",
    },
  },
};

export default widget;
