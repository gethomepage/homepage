import genericProxyHandler from "utils/proxy/handlers/generic";

const widget = {
  api: "{url}/{endpoint}",
  proxyHandler: genericProxyHandler,

  mappings: {
    status: {
      endpoint: "status",
      validate: [
        "numActiveSessions",
        "numConnections",
        "bytesProxied"
      ]
    },
  },
};

export default widget;
