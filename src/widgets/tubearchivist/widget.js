import credentialedProxyHandler from "utils/proxy/handlers/credentialed";

const widget = {
  api: "{url}/api/{endpoint}",
  proxyHandler: credentialedProxyHandler,

  mappings: {
    downloads: {
      endpoint: "download",
    },
    videos: {
      endpoint: "video",
    },
    channels: {
      endpoint: "channel",
    },
    playlists: {
      endpoint: "playlist",
    },
  },
};

export default widget;
