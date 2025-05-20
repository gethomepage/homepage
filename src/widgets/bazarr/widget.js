import { asJson } from "utils/proxy/api-helpers";
import genericProxyHandler from "utils/proxy/handlers/generic";

const widget = {
  api: "{url}/api/{endpoint}/wanted?apikey={key}",
  proxyHandler: genericProxyHandler,

  mappings: {
    movies: {
      endpoint: "movies",
      map: (data) => ({
        total: asJson(data).total,
      }),
    },
    episodes: {
      endpoint: "episodes",
      map: (data) => ({
        total: asJson(data).total,
      }),
    },
  },
};

export default widget;
