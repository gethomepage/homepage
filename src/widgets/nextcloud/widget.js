import genericProxyHandler from "utils/proxy/handlers/generic";

const widget = {
  api: "{url}/{endpoint}",
  proxyHandler: genericProxyHandler,

  mappings: {
    serverinfo: {
      endpoint: "ocs/v2.php/apps/serverinfo/api/v1/info?format=json",
    },
  },
};

export default widget;