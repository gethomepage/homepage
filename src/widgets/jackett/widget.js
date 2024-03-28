import jackettProxyHandler from "./proxy";

const widget = {
  api: "{url}/api/v2.0/{endpoint}?apikey={key}&configured=true",
  proxyHandler: jackettProxyHandler,
  loginURL: "{url}/UI/Dashboard",

  mappings: {
    indexers: {
      endpoint: "indexers",
    },
  },
};

export default widget;
