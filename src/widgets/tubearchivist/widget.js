import credentialedProxyHandler from "utils/proxy/handlers/credentialed";

const widget = {
  api: "{url}/api/{endpoint}",
  proxyHandler: credentialedProxyHandler,

  mappings: {
    downloads: {
      endpoint: "stats/download",
      validate: ["doc_count"],
    },
    videos: {
      endpoint: "stats/video",
      validate: ["doc_count"],
    },
    channels: {
      endpoint: "stats/channel",
      validate: ["doc_count"],
    },
    playlists: {
      endpoint: "stats/playlist",
      validate: ["doc_count"],
    },
    stats: {
      endpoint: "stats",
    },
  },
};

export default widget;
