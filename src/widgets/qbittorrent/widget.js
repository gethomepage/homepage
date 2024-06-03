import qbittorrentProxyHandler from "./proxy";

const widget = {
  proxyHandler: qbittorrentProxyHandler,

  mappings: {
    torrents: {
      endpoint: "torrents/info",
    },
  },
};

export default widget;
