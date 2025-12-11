import credentialedProxyHandler from "utils/proxy/handlers/credentialed";

const widget = {
  api: "{url}/api/{endpoint}",
  proxyHandler: credentialedProxyHandler,

  mappings: {
    bookmarks: {
      endpoint: "bookmarks/",
      validate: ["count"],
    },
    tags: {
      endpoint: "tags/",
      validate: ["count"],
    },
  },
};

export default widget;
