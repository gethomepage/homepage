import credentialedProxyHandler from "utils/proxy/handlers/credentialed";

const widget = {
  api: "{url}/api/v3/{endpoint}/{uuid}",
  proxyHandler: credentialedProxyHandler,

  mappings: {
    checks: {
      endpoint: "checks",
    },
  },
};

export default widget;
