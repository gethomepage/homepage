import dispatcharrProxyHandler from "./proxy";

const widget = {
  api: "{url}/{endpoint}",
  proxyHandler: dispatcharrProxyHandler,

  mappings: {
    token: {
      endpoint: "api/accounts/token/",
    },
    channels: {
      endpoint: "api/channels/channels/",
    },
    streams: {
      endpoint: "proxy/ts/status",
    },
  },
};

export default widget;
