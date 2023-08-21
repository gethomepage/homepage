import genericProxyHandler from "utils/proxy/handlers/generic";
import { jsonArrayFilter, asJson } from "utils/proxy/api-helpers";

const widget = {
  api: "{url}/api/server/{endpoint}",
  proxyHandler: genericProxyHandler,

  mappings: {
    info: {
      endpoint: "info"
    }
  },
};

export default widget;