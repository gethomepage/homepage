import plexProxyHandler from "./proxy";

const widget = {
  api: "{url}{endpoint}?X-Plex-Token={key}",
  proxyHandler: plexProxyHandler,

  mappings: {
    unified: {
      endpoint: "/",
    },
  },
};

export default widget;
