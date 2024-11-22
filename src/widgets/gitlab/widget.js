import { asJson } from "utils/proxy/api-helpers";
import credentialedProxyHandler from "utils/proxy/handlers/credentialed";

const widget = {
  api: "{url}/api/v4/{endpoint}",
  proxyHandler: credentialedProxyHandler,
  mappings: {
    events: {
      endpoint: "events",
      map: (data) => ({
        count: asJson(data).length,
      }),
    },
    issues: {
      endpoint: "issues?state=opened",
      map: (data) => ({
        count: asJson(data).length,
      }),
    },
    merges: {
      endpoint: "merge_requests?state=opened",
      map: (data) => ({
        count: asJson(data).length,
      }),
    },
  },
};

export default widget;
