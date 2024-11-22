import { asJson } from "utils/proxy/api-helpers";
import credentialedProxyHandler from "utils/proxy/handlers/credentialed";

const widget = {
  api: "{url}/api/v4/{endpoint}",
  proxyHandler: credentialedProxyHandler,
  mappings: {
    events: {
      endpoint: "events",
      map: (data) => ({
        merges: asJson(data).filter((event) => event.target_type?.toLowerCase() === "merge_request"),
        issues: asJson(data).filter((event) => event.target_type?.toLowerCase() === "issue"),
        events: asJson(data).length,
      }),
    },
  },
};

export default widget;
