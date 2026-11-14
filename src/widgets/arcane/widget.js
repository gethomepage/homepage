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
      endpoint: "environments/{env}/containers?limit=-1",
      map: (data) => {
        const json = asJson(data);
        const containerList = json?.data || [];
        const containerUpdates = Array.isArray(containerList)
          ? containerList.filter((c) => c?.updateInfo?.hasUpdate === true).length
          : 0;
        return {
          imagesWithUpdates: containerUpdates,
        };
      },
    },
  },
};

export default widget;
