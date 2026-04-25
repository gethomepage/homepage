import navidromeProxyHandler from "./proxy";

const widget = {
  api: "{url}",
  proxyHandler: navidromeProxyHandler,

  mappings: {
    getNowPlaying: {
      endpoint: "getNowPlaying",
    },
    Library: {
      endpoint: "Library",
      validate: ["totalSongs", "totalAlbums", "totalArtists"],
    },
  },
};

export default widget;
