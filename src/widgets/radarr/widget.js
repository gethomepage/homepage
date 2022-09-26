import genericProxyHandler from "utils/proxy/handlers/generic";
import { jsonArrayFilter } from "utils/proxy/api-helpers";

const widget = {
  api: "{url}/api/v3/{endpoint}?apikey={key}",
  proxyHandler: genericProxyHandler,

  mappings: {
    movie: {
      endpoint: "movie",
      map: (data) => ({
        wanted: jsonArrayFilter(data, (item) => item.isAvailable === false).length,
        have: jsonArrayFilter(data, (item) => item.isAvailable === true).length,
      }),
    },
    "queue/status": {
      endpoint: "queue/status",
    },
  },
};

export default widget;
