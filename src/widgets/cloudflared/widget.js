import cloudflaredProxyHandler from "./proxy";

const widget = {
  api: "https://api.cloudflare.com/client/v4/accounts/{accountid}/cfd_tunnel",
  proxyHandler: cloudflaredProxyHandler,

  mappings: {
    status: {
      endpoint: "/",
    },
  },
};

export default widget;
