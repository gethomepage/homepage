import { jsonArrayFilter } from "utils/proxy/api-helpers";
import genericProxyHandler from "utils/proxy/handlers/generic";

const widget = {
  api: "{url}/api/v2.0/{endpoint}",
  proxyHandler: genericProxyHandler,

  mappings: {
    alerts: {
      endpoint: "alert/list",
      map: (data) => ({
        pending: jsonArrayFilter(data, (item) => item?.dismissed === false).length,
      }),
    },
    status: {
      endpoint: "system/info",
    },
  },
};

export default widget;
