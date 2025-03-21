import credentialedProxyHandler from "utils/proxy/handlers/credentialed";
import { asJson } from "utils/proxy/api-helpers";

const widget = {
  api: `{url}/api/v0/{endpoint}`,
  proxyHandler: credentialedProxyHandler,

  mappings: {
    application: {
      endpoint: "application",
    },
    downloads: {
      endpoint: "transfers/downloads",
    },
    uploads: {
      endpoint: "transfers/uploads",
    },
  },
};

export default widget;
