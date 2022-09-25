import genericProxyHandler from "utils/proxies/generic";

const widget = {
  api: "{url}/api/?apikey={key}&output=json&mode={endpoint}",
  proxyHandler: genericProxyHandler,

  mappings: {
    queue: {
      endpoint: "queue",
    },
  },
};

export default widget;
