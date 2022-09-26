import genericProxyHandler from "utils/proxies/generic";
import { jsonArrayFilter } from "utils/api-helpers";

const widget = {
  api: "{url}/api/v1/{endpoint}?apikey={key}",
  proxyHandler: genericProxyHandler,

  mappings: {
    album: {
      endpoint: "album",
      map: (data) => ({
        have: jsonArrayFilter(data, (item) => item?.statistics?.percentOfTracks === 100).length,
      }),
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
