import genericProxyHandler from "utils/proxy/handlers/generic";

const widget = {
  api: "{url}/api/v2?apikey={key}&cmd={endpoint}",
  proxyHandler: genericProxyHandler,

  mappings: {
    get_history: {
      endpoint: "get_history",
      params: ["include_activity", "length"],
    },
  },
};

export default widget;
