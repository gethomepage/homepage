import genericProxyHandler from "utils/proxy/handlers/generic";
import { jsonArrayFilter } from "utils/proxy/api-helpers";

const widget = {
  api: "{url}/api/v1/{endpoint}?apikey={key}",
  proxyHandler: genericProxyHandler,

  mappings: {
    book: {
      endpoint: "book",
      map: (data) => ({
        have: jsonArrayFilter(data, (item) => item?.statistics?.bookFileCount > 0).length,
      }),
    },
    "queue/status": {
      endpoint: "queue/status",
    },
    "wanted/missing": {
      endpoint: "wanted/missing",
    },
  },
};

export default widget;
