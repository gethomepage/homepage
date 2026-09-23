import { asJson } from "utils/proxy/api-helpers";
import credentialedProxyHandler from "utils/proxy/handlers/credentialed";

const widget = {
  api: "{url}/v1/{endpoint}",
  proxyHandler: credentialedProxyHandler,

  mappings: {
    counters: {
      endpoint: "feeds/counters",
      map: (data) => {
        const { reads, unreads } = asJson(data);
        return {
          read: Object.values(reads).reduce((acc, i) => acc + i, 0),
          unread: Object.values(unreads).reduce((acc, i) => acc + i, 0),
        };
      },
    },
  },
};

export default widget;
