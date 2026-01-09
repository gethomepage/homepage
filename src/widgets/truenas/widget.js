import truenasProxyHandler from "./proxy";

import { asJson, jsonArrayFilter } from "utils/proxy/api-helpers";

const widget = {
  api: "{url}/api/v2.0/{endpoint}",
  wsAPI: "{url}/api/current",
  proxyHandler: truenasProxyHandler,

  mappings: {
    alerts: {
      endpoint: "alert/list",
      wsMethod: "alert.list",
      map: (data) => {
        if (Array.isArray(data)) {
          return { pending: data.filter((item) => item?.dismissed === false).length };
        }
        return { pending: jsonArrayFilter(data, (item) => item?.dismissed === false).length };
      },
    },
    status: {
      endpoint: "system/info",
      wsMethod: "system.info",
      validate: ["loadavg", "uptime_seconds"],
    },
    pools: {
      endpoint: "pool",
      wsMethod: "pool.query",
      map: (data) => {
        const list = Array.isArray(data) ? data : asJson(data);
        return list.map((entry) => ({
          id: entry.name,
          name: entry.name,
          healthy: entry.healthy,
        }));
      },
    },
    dataset: {
      endpoint: "pool/dataset",
      wsMethod: "pool.dataset.query",
    },
  },
};

export default widget;
