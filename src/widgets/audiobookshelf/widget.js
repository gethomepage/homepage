import audiobookshelfProxyHandler from "./proxy";

const widget = {
  api: "{url}/api/{endpoint}",
  proxyHandler: audiobookshelfProxyHandler,

  mappings: {
    libraries: {
      endpoint: "libraries",
    },
  },
};

export default widget;