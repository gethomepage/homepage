import genericProxyHandler from "utils/proxies/generic";
import { asJson } from "utils/api-helpers";

const widget = {
  api: "{url}/api/v3/{endpoint}?apikey={key}",
  proxyHandler: genericProxyHandler,

  mappings: {
    series: {
      endpoint: "series",
      map: (data) => ({
        total: asJson(data).length,
      }),
    },
    queue: {
      endpoint: "queue",
    },
    "wanted/missing": {
      endpoint: "wanted/missing",
    },
  },
};

export default widget;
