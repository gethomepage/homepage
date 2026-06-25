import credentialedProxyHandler from "utils/proxy/handlers/credentialed";

const widget = {
  api: "{url}/api/{endpoint}",
  proxyHandler: credentialedProxyHandler,

  mappings: {
    users: {
      endpoint: "users?pagination[limit]=1",
      validate: ["pagination"],
    },
    oidcClients: {
      endpoint: "oidc/clients?pagination[limit]=1",
      validate: ["pagination"],
    },
  },
};

export default widget;
