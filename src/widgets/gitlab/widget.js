import { asJson } from "utils/proxy/api-helpers";
import credentialedProxyHandler from "utils/proxy/handlers/credentialed";

const widget = {
  api: "{url}/api/v1/{endpoint}",
  proxyHandler: credentialedProxyHandler,
  mappings: {
    events: {
      endpoint: "events",
      map: (data) => ({
        merges: asJson(data).filter((event) => event.target_type?.toLowerCase() === "merge_request"),
        issues: asJson(data).filter((event) => event.target_type?.toLowerCase() === "issue"),
        events: asJson(data).length
      })
    },
    issues: {
      endpoint: "issues",
      params: ["state"]
    },
    openIssues: {
      endpoint: "issues?state=opened"
    },
    closedIssues: {
      endpoint: "issues?state=closed"
    },
    mergeRequests: {
      endpoint: "merge_requests",
      params: ["state"]
    },
    openMergeRequests: {
      endpoint: "merge_requests?state=opened"
    },
    closedMergeRequests: {
      endpoint: "merge_requests?state=closed"
    }
  }
};

export default widget;
