import genericProxyHandler from "utils/proxy/handlers/generic";
import { jsonArrayFilter } from "utils/proxy/api-helpers";

const widget = {
  api: "{url}/{endpoint}",
  proxyHandler: genericProxyHandler,

  mappings: {
    "lineup.json": {
      endpoint: "lineup.json",
    }
  },
};

export default widget;
