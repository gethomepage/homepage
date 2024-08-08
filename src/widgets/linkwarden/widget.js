import linkwardenProxyHandler from "./proxy";

const widget = {
  api: "{url}/api/v1/{endpoint}",
  proxyHandler: linkwardenProxyHandler,

  mappings: {
    collections: {
      endpoint: "collections",
    },
    tags: {
      endpoint: "tags",
    },
    links: {
      endpoint: "links",
    },
  },
};

export default widget;
