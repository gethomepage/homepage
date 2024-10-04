import credentialedProxyHandler from "utils/proxy/handlers/credentialed";
import { jsonArrayFilter } from "utils/proxy/api-helpers";

const widget = {
  api: `{url}/api/v1/{endpoint}`,
  proxyHandler: credentialedProxyHandler,

  mappings: {
    projects: {
      endpoint: "projects",
      map: (data) => ({
       projects: jsonArrayFilter(data, (item) => !item.isArchived).length,
      }),
    },
    tasks: {
      endpoint: "tasks/all",
      // to filter by done=false and dueDate <= now+7d or whatever
      params: ["filter"],
      map: (data) => ({
       tasks: jsonArrayFilter(data, (item) => !item.done).length,
      }),
    },
  },
};

export default widget;
