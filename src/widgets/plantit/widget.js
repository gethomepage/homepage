import { asJson } from "utils/proxy/api-helpers";
import credentialedProxyHandler from "utils/proxy/handlers/credentialed";

const widget = {
  api: "{url}/api/{endpoint}",
  proxyHandler: credentialedProxyHandler,

  mappings: {
    plantit: {
      endpoint: "stats",
    },
    map: (data) => ({
      events: Object.values(asJson(data).diaryEntryCount).reduce((acc, i) => acc + i, 0),
      plants: Object.values(asJson(data).plantCount).reduce((acc, i) => acc + i, 0),
      photos: Object.values(asJson(data).imageCount).reduce((acc, i) => acc + i, 0),
      species: Object.values(asJson(data).botanicalInfoCount).reduce((acc, i) => acc + i, 0),
    }),
  },
};

export default widget;
