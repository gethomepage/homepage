import genericProxyHandler from "utils/proxy/handlers/generic";

const widget = {
  api: "{url}/api/?apikey={key}&output=json&mode={endpoint}",
  proxyHandler: genericProxyHandler,

  mappings: {
    queue: {
      endpoint: "queue",
      validate: [
        "queue"
      ]
    },
  },
};

export default widget;
