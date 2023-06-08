import genericProxyHandler from "utils/proxy/handlers/generic";
import { jsonArrayFilter } from "utils/proxy/api-helpers";

const widget = {
  api: "{url}/api/v1/{endpoint}?apikey={key}",
  proxyHandler: genericProxyHandler,

  mappings: {
    artist: {
      endpoint: "artist",
    },
    "wanted/missing": {
      endpoint: "wanted/missing",
    },
    "queue/status": {
      endpoint: "queue/status",
    },
  },
};

export default widget;
