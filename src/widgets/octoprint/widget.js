import credentialedProxyHandler from "utils/proxy/handlers/credentialed";
import { jsonArrayFilter } from "utils/proxy/api-helpers";

const widget = {
  api: "{url}/api/{endpoint}",
  proxyHandler: credentialedProxyHandler,

  mappings: {
    "job": {
      endpoint: "job",
    }
  },
};

export default widget;
