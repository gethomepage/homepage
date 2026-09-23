import { asJson } from "utils/proxy/api-helpers";
import genericProxyHandler from "utils/proxy/handlers/generic";

const widget = {
  api: "{url}/api/v1/{endpoint}?access_token={key}",
  proxyHandler: genericProxyHandler,

  mappings: {
    notifications: {
      endpoint: "notifications",
    },
    issues: {
      endpoint: "repos/issues/search",
      map: (data) => {
        const items = asJson(data);
        return {
          pulls: items.filter((issue) => issue.pull_request),
          issues: items.filter((issue) => !issue.pull_request),
        };
      },
    },
    repositories: {
      endpoint: "repos/search",
    },
  },
};

export default widget;
