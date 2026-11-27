import kopiaProxyHandler from "./proxy";

const widget = {
  api: "{url}/{endpoint}",
  proxyHandler: kopiaProxyHandler,

  mappings: {
    status: {
      endpoint: "api/v1/sources",
    },
  },
};

export default widget;
