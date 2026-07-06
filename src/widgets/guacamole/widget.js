import guacamoleProxyHandler from "./proxy";

const widget = {
  api: "{url}/api/session/data/{datasource}/{endpoint}",
  proxyHandler: guacamoleProxyHandler,

  mappings: {
    activeConnections: {
      endpoint: "activeConnections",
    },
    connections: {
      endpoint: "connections",
    },
    users: {
      endpoint: "users",
    },
  },
};

export default widget;
