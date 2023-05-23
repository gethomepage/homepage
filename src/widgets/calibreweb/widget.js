import credentialedProxyHandler from "utils/proxy/handlers/credentialed";

const widget = {
  api: "{url}/{endpoint}",
  proxyHandler: credentialedProxyHandler,

  mappings: {
    books: {
      endpoint: "ajax/listbooks",
    },
    authors: {
      endpoint: "get_authors_json",
    },
    series: {
      endpoint: "get_series_json",
    },
  },
};

export default widget;
