import credentialedProxyHandler from "utils/proxy/handlers/credentialed";

const widget = {
  api: "{url}/{endpoint}",
  proxyHandler: credentialedProxyHandler,

  mappings: {
    serverinfo: {
      endpoint: "ocs/v2.php/apps/serverinfo/api/v1/info?format=json",
    },
  },
};

export default widget;
