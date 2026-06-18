import genericProxyHandler from "utils/proxy/handlers/generic";

const widget = {
  api: "{url}/{endpoint}",
  proxyHandler: genericProxyHandler,

  mappings: {
    resources: {
      endpoint: "api/resources",
      headers: {
        "X-API-Token": "{key}",
      },
    },
  },
};

export default widget;
