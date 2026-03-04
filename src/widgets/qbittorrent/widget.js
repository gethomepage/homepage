import qbittorrentProxyHandler from "./proxy";

const widget = {
  proxyHandler: qbittorrentProxyHandler,

  mappings: {
    transfer: {
      endpoint: "transfer/info",
    },
    torrentCount: {
      endpoint: "torrents/count",
      optionalParams: ["filter"],
    },
    torrents: {
      endpoint: "torrents/info",
      optionalParams: ["filter"],
    },
  },
};

export default widget;
