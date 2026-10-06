import credentialedProxyHandler from "utils/proxy/handlers/credentialed";

const widget = {
  api: "https://api.cloudflare.com/client/v4/accounts/{accountid}/{endpoint}",
  proxyHandler: credentialedProxyHandler,

  mappings: {
    cfd_tunnel: {
      endpoint: "cfd_tunnel/{tunnelid}",
      validate: ["success", "result"],
    },
    connections: {
      endpoint: "cfd_tunnel/{tunnelid}/connections",
      validate: ["success", "result"],
    },
  },
};

export default widget;
