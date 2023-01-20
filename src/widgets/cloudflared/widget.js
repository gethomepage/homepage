import credentialedProxyHandler from "utils/proxy/handlers/credentialed";

const widget = {
  api: "https://api.cloudflare.com/client/v4/accounts/{accountid}/{endpoint}/{tunnelid}?",
  proxyHandler: credentialedProxyHandler,

  mappings: {
    "cfd_tunnel": {
      endpoint: "cfd_tunnel",
      validate: [
        "origin_ip",
        "status",
      ],
    },
  },
};

export default widget;
