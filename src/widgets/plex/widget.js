import plexProxyHandler from "./proxy";

const widget = {
  api: "{url}{endpoint}?X-Plex-Token={token}",
  proxyHandler: plexProxyHandler,

  mappings: {
    unified: {
      endpoint: "/",
    },
  },
};

export default widget;
