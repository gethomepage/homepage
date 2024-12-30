import hoarderProxyHandler from "./proxy";

const widget = {
  api: "{url}/api/{endpoint}",
  proxyHandler: hoarderProxyHandler,

  mappings: {
    bookmarks: {
      endpoint: "bookmarks",
    },
    notes: {
      endpoint: "notes",
    },
  },
};

export default widget;
