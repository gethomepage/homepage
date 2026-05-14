import navidromeProxyHandler from "./proxy";

const widget = {
  api: "{url}/rest/{endpoint}?u={user}&t={token}&s={salt}&v=1.16.1&c=homepage&f=json",
  proxyHandler: navidromeProxyHandler,

  mappings: {
    getNowPlaying: {
      endpoint: "getNowPlaying",
    },
    libraryStats: {
      endpoint: "libraryStats",
    },
  },
};

export default widget;
