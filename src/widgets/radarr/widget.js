import genericProxyHandler from "utils/proxy/handlers/generic";
import { jsonArrayFilter } from "utils/proxy/api-helpers";

function isAvailable(item) {
  // isAvailable means that a digital image exists
  // E.g. it's available to stream or on DVD, etc
  if (item.isAvailable === false) {
    return false;
  }

  // sizeOnDisk is how much of that digital image you currently have
  // movieFile.size is how large the requested digital image is
  return item.sizeOnDisk === item.movieFile?.size;
}

const widget = {
  api: "{url}/api/v3/{endpoint}?apikey={key}",
  proxyHandler: genericProxyHandler,

  mappings: {
    movie: {
      endpoint: "movie",
      map: (data) => ({
        wanted: jsonArrayFilter(data, (item) => !isAvailable(item)).length,
        have: jsonArrayFilter(data, (item) => isAvailable(item)).length,
      }),
    },
    "queue/status": {
      endpoint: "queue/status",
    },
  },
};

export default widget;
