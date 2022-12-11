import genericProxyHandler from "utils/proxy/handlers/generic";
import { asJson } from "utils/proxy/api-helpers";

const widget = {
  api: "{url}/api/v3/{endpoint}?apikey={key}",
  proxyHandler: genericProxyHandler,

  mappings: {
    series: {
      endpoint: "series",
      map: (data) => ({
        total: asJson(data).length,
      })
    },
    queue: {
      endpoint: "queue",
      validate: [
        "totalRecords"
      ]
    },
    "wanted/missing": {
      endpoint: "wanted/missing",
      validate: [
        "totalRecords"
      ]
    },
  },
};

export default widget;
