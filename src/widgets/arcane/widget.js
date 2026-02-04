import { asJson } from "utils/proxy/api-helpers";
import credentialedProxyHandler from "utils/proxy/handlers/credentialed";

const widget = {
  api: "{url}/api/{endpoint}",
  proxyHandler: credentialedProxyHandler,

  mappings: {
    containers: {
      endpoint: "environments/{env}/containers/counts",
      map: (data) => asJson(data).data,
    },
    images: {
      endpoint: "environments/{env}/images/counts",
      map: (data) => asJson(data).data,
    },
    updates: {
      endpoint: "environments/{env}/image-updates/summary",
      map: (data) => asJson(data).data,
    },
  },
};

export default widget;
