import genericProxyHandler from "utils/proxy/handlers/generic";

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
