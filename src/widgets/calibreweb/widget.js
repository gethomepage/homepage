import calibreWebProxyHandler from "./proxy";

const widget = {
  api: "{url}/{endpoint}",
  proxyHandler: calibreWebProxyHandler,

  mappings: {
    books: {
      endpoint: "opds/books/letter/00",
    },
  },
};

export default widget;
