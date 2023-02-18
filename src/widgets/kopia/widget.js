import genericProxyHandler from "utils/proxy/handlers/generic";

const widget = {
  api: "{url}/{endpoint}",
  proxyHandler: genericProxyHandler,

  mappings: {
    status: {
      endpoint: "api/v1/sources",
    },
    tasks: {
      endpoint: "api/v1/tasks",
    },
  },
};

export default widget;