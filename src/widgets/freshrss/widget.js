import { asJson } from "utils/proxy/api-helpers";
import credentialedProxyHandler from "utils/proxy/handlers/credentialed";

const widget = {
  api: "{url}/api/greader.php/{endpoint}?output=json",
  proxyHandler: credentialedProxyHandler,

  mappings: {
    subscriptions: {
      endpoint: "reader/api/0/subscription/list",
      map: (data) => ({
        count: asJson(data).subscriptions.length
      }),
    },
    unread: {
      endpoint: "reader/api/0/unread-count",
      map: (data) => ({
        count: asJson(data).max
      }),
    }
  }
};

export default widget;
