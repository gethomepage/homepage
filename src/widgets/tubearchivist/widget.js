import credentialedProxyHandler from "utils/proxy/handlers/credentialed";

const widget = {
  api: "{url}/api/{endpoint}",
  proxyHandler: credentialedProxyHandler,

  mappings: {
    downloads: {
      endpoint: "download",
      validate: [
        "paginate",
      ]
    },
    videos: {
      endpoint: "video",
      validate: [
        "paginate",
      ]
    },
    channels: {
      endpoint: "channel",
      validate: [
        "paginate",
      ]
    },
    playlists: {
      endpoint: "playlist",
      validate: [
        "paginate",
      ]
    },
  },
};

export default widget;
