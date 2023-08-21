import calibreWebProxyHandler from "./proxy";

const widget = {
  api: "{url}/{endpoint}",
  proxyHandler: calibreWebProxyHandler,

  mappings: {
    books: {
      endpoint: "opds/books/letter/00",
    },
    authors: {
      endpoint: "opds/author/letter/00",
    },
    series: {
      endpoint: "opds/series/letter/00",
    },
  },
};

export default widget;
