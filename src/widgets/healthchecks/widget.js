import credentialedProxyHandler from "utils/proxy/handlers/credentialed";

const widget = {
  api: "https://healthchecks.io/api/v2/{endpoint}/{uuid}",
  proxyHandler: credentialedProxyHandler,

  mappings: {
    checks: {
      endpoint: "checks",
      validate: [
        "status",
        "last_ping",
      ]
    },
  },
};

export default widget;
