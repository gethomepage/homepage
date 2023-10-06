import credentialedProxyHandler from "utils/proxy/handlers/credentialed";

const widget = {
  api: "{url}/_synapse/admin/{endpoint}",
  proxyHandler: credentialedProxyHandler,

  mappings: {
    users: {
      endpoint: "v2/users",
    },
    rooms: {
      endpoint: "v1/rooms",
    },
    peers: {
      endpoint: "v1/federation/destinations",
    },
  },
};

export default widget;
