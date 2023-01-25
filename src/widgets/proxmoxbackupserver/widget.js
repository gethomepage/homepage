import credentialedProxyHandler from "utils/proxy/handlers/credentialed";

const since = Date.now() - (24 * 60 * 60 * 1000);

const widget = {
  api: "{url}/api2/json/{endpoint}",
  proxyHandler: credentialedProxyHandler,

  mappings: {
    "status/datastore-usage": {
      endpoint: "status/datastore-usage",
    },
    "nodes/localhost/tasks": {
      endpoint: `nodes/localhost/tasks?errors=true&limit=100&since=${since}`,
    },
    "nodes/localhost/status": {
      endpoint: "nodes/localhost/status",
    },
  },
};

export default widget;
