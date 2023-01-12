import unmanicProxyHandler from "./proxy";

import { asJson } from "utils/proxy/api-helpers";

const widget = {
  api: "{url}/unmanic/api/v2/{endpoint}",
  proxyHandler: unmanicProxyHandler,

  mappings: {
    workers: {
      endpoint: "workers/status",
      map: (data) => ({
        total_workers: (asJson(data).workers_status).length,
        active_workers: (asJson(data).workers_status).filter(worker => !worker.idle).length,
      })
    },
    pending: {
      method: "POST",
      endpoint: "pending/tasks",
      validate: [
        "recordsTotal"
      ]
    },
  },
};

export default widget;
