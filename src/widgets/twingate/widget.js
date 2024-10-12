import { asJson } from "utils/proxy/api-helpers";
import credentialedProxyHandler from "utils/proxy/handlers/credentialed";

const widget = {
  api: "{url}/api/{endpoint}",
  proxyHandler: credentialedProxyHandler,

  mappings: {
    stats: {
      method: "GET",
      endpoint: "graphql",
      map: (data) => asJson(data).data,
      params:[
        "query"
      ]
    },
  },
};

export default widget;
