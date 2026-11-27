import bookstackProxyHandler from "./proxy";

const widget = {
  api: "{url}/{endpoint}",
  proxyHandler: bookstackProxyHandler,

  mappings: {
    stats: {
      endpoint: "stats",
      validate: ["shelves", "books", "chapters", "pages"],
    },
  },
};

export default widget;
