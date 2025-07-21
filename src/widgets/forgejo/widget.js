import { asJson } from "utils/proxy/api-helpers";
import credentialedProxyHandler from "utils/proxy/handlers/credentialed";

const widget = {
  api: "{url}/api/v1/{endpoint}",
  proxyHandler: credentialedProxyHandler,

  mappings: {
    notifications: {
      endpoint: "notifications",
    },
    issues: {
      endpoint: "repos/issues/search",
      map: (data) => ({
        pulls: asJson(data).filter((issue) => issue.pull_request),
        issues: asJson(data).filter((issue) => !issue.pull_request),
      }),
    },
    repositories: {
      endpoint: "repos/search",
    },
  },
};

export default widget;
