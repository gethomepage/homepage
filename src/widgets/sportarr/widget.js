import { asJson } from "utils/proxy/api-helpers";
import genericProxyHandler from "utils/proxy/handlers/generic";

const widget = {
  api: "{url}/api/{endpoint}?apikey={key}",
  proxyHandler: genericProxyHandler,

  mappings: {
    "wanted/missing": {
      endpoint: "wanted/missing",
      params: ["page", "pageSize"],
      validate: ["totalRecords"],
    },
    queue: {
      endpoint: "queue",
      map: (data) => ({ total: asJson(data).length }),
    },
    leagues: {
      endpoint: "leagues",
      map: (data) => ({ total: asJson(data).length }),
    },
  },
};

export default widget;
