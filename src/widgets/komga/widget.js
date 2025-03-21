import komgaProxyHandler from "./proxy";

const widget = {
  api: "{url}/api/v1/{endpoint}",
  proxyHandler: komgaProxyHandler,

  mappings: {
    libraries: {
      endpoint: "libraries",
    },
    series: {
      endpoint: "series",
      validate: ["totalElements"],
    },
    seriesv2: {
      endpoint: "series/list",
      method: "POST",
      validate: ["totalElements"],
    },
    books: {
      endpoint: "books",
      validate: ["totalElements"],
    },
    booksv2: {
      endpoint: "books/list",
      method: "POST",
      validate: ["totalElements"],
    },
  },
};

export default widget;
