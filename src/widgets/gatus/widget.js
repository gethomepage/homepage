// import credentialedProxyHandler from "utils/proxy/handlers/credentialed";
import genericProxyHandler from "utils/proxy/handlers/generic";

const widget = {
  api: "{url}/{endpoint}",
  proxyHandler: genericProxyHandler,

  mappings: {
    status: {
      endpoint: "api/v1/endpoints/statuses",
    },
  },
};

export default widget;
