import truenasProxyHandler from "./proxy";

import { asJson, jsonArrayFilter } from "utils/proxy/api-helpers";

const widget = {
  api: "{url}/api/v2.0/{endpoint}",
  proxyHandler: truenasProxyHandler,

  mappings: {
    alerts: {
      endpoint: "alert/list",
      map: (data) => ({
        pending: jsonArrayFilter(data, (item) => item?.dismissed === false).length,
      }),
    },
    status: {
      endpoint: "system/info",
      validate: ["loadavg", "uptime_seconds"],
    },
    pools: {
      endpoint: "pool",
      map: (data) =>
        asJson(data).map((entry) => ({
          id: entry.name,
          name: entry.name,
          status: entry.status,
          healthy: entry.healthy,
          used: entry.allocated,
          size: entry.size,
          free: entry.free,
        })),
    },
  },
};

export default widget;
