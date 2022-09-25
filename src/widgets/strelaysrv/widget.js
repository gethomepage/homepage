import genericProxyHandler from "utils/proxies/generic";

const widget = {
  api: "{url}/{endpoint}",
  proxyHandler: genericProxyHandler,

  mappings: {
    status: {
      endpoint: "status",
    },
  },
};

export default widget;
