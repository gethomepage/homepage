import credentialedProxyHandler from "utils/proxy/handlers/credentialed";
import { jsonArrayFilter } from "utils/proxy/api-helpers";

const widget = {
  api: `{url}/api/v1/{endpoint}`,
  proxyHandler: credentialedProxyHandler,

  mappings: {
    projects: {
      endpoint: "projects",
    },
    tasks: {
      endpoint: "tasks/all",
      params: ["filter", "sort_by"],
      map: (data) => ({
        tasks7d: jsonArrayFilter(
          data,
          (item) =>
            new Date(item.due_date).valueOf() > 978307168000 &&
            new Date(item.due_date).valueOf() <= new Date(Date.now() + 640800000).valueOf(),
        ).length,
        inProgress: jsonArrayFilter(data, (item) => !item.done && item.percent_done > 0 && item.percent_done < 1)
          .length,
        overdue: jsonArrayFilter(
          data,
          (item) =>
            new Date(item.due_date).valueOf() > 978307168000 &&
            new Date(item.due_date).valueOf() <= new Date(Date.now()),
        ).length,
      }),
    },
  },
};

export default widget;
