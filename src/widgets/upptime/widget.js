import genericProxyHandler from "utils/proxy/handlers/generic";

const widget = {
  api: "{url}/{endpoint}",
  proxyHandler: genericProxyHandler,

  mappings: {
    "summary": {
      endpoint: "summary.json",
    },
  }
};

export default widget;
