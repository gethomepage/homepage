import { asJson, jsonArrayFilter } from "utils/proxy/api-helpers";
import truenasProxyHandler from "utils/proxy/handlers/truenas";

const widget = {
  api: "{url}/api/current",
  proxyHandler: truenasProxyHandler,

  mappings: {
    alerts: {
      endpoint: "alert.list",
      params: [],
      map: (data) => ({
        pending: jsonArrayFilter(data, (item) => item?.dismissed === false).length,
      }),
    },
    status: {
      endpoint: "system.info",
      params: [],
      validate: ["loadavg", "uptime_seconds"],
    },
    pools: {
      endpoint: "pool.query",
      params: [],
      map: (data) =>
        asJson(data).map((entry) => ({
          id: entry.name,
          name: entry.name,
          healthy: entry.healthy,
        })),
    },
    dataset: {
      endpoint: "pool.dataset.query",
      params: [],
    },
  },
};

export default widget;
