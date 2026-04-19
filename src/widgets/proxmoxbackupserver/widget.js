import credentialedProxyHandler from "utils/proxy/handlers/credentialed";

const widget = {
  api: "{url}/api2/json/{endpoint}",
  proxyHandler: credentialedProxyHandler,

  mappings: {
    "status/datastore-usage": {
      endpoint: "status/datastore-usage",
    },
    "nodes/localhost/tasks": {
      endpoint: "nodes/localhost/tasks",
    },
    "nodes/localhost/status": {
      endpoint: "nodes/localhost/status",
    },
  },
};

export default widget;
