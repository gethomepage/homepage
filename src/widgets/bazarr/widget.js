import genericProxyHandler from "utils/proxies/generic";
import { asJson } from "utils/api-helpers";

const widget = {
  api: "{url}/api/{endpoint}/wanted?apikey={key}",
  proxyHandler: genericProxyHandler,

  mappings: {
    "movies": {
      endpoint: "movies",
      map: (data) => ({
        total: asJson(data).total,
      }),
    },
    "episodes": {
      endpoint: "episodes",
      map: (data) => ({
        total: asJson(data).total,
      }),
    },
  },
};

export default widget;
