import credentialedProxyHandler from "utils/proxy/handlers/credentialed";

const leechQuery = `limit=100&sort=dlspeed&order=desc&filters=${encodeURIComponent(JSON.stringify({ status: ["downloading"] }))}`;

const widget = {
  api: "{url}/api/{endpoint}",
  proxyHandler: credentialedProxyHandler,

  mappings: {
    torrents: {
      endpoint: "instances/{instance}/torrents?limit=1",
      validate: ["stats"],
    },
    torrentsAll: {
      endpoint: "torrents/cross-instance?limit=1",
      validate: ["stats"],
    },
    leech: {
      endpoint: `instances/{instance}/torrents?${leechQuery}`,
    },
    leechAll: {
      endpoint: `torrents/cross-instance?${leechQuery}`,
    },
  },
};

export default widget;
