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
      map: (data) => ({
        pulls: asJson(data).filter((issue) => issue.pull_request),
        issues: asJson(data).filter((issue) => !issue.pull_request),
      }),
    },
  },
};

export default widget;
