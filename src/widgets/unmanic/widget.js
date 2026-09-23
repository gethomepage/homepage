import { asJson } from "utils/proxy/api-helpers";
import genericProxyHandler from "utils/proxy/handlers/generic";

const widget = {
  api: "{url}/unmanic/api/v2/{endpoint}",
  proxyHandler: genericProxyHandler,

  mappings: {
    workers: {
      endpoint: "workers/status",
      map: (data) => {
        const workers = asJson(data).workers_status;
        return {
          total_workers: workers.length,
          active_workers: workers.filter((worker) => !worker.idle).length,
        };
      },
    },
    pending: {
      method: "POST",
      body: "{}",
      endpoint: "pending/tasks",
      validate: ["recordsTotal"],
    },
  },
};

export default widget;
