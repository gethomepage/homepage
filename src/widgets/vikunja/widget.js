import credentialedProxyHandler from "utils/proxy/handlers/credentialed";
import { asJson } from "utils/proxy/api-helpers";

const widget = {
  api: `{url}/api/v1/{endpoint}`,
  proxyHandler: credentialedProxyHandler,

  mappings: {
    projects: {
      endpoint: "projects",
    },
    tasks: {
      endpoint: "tasks/all?filter=done%3Dfalse&sort_by=due_date",
      map: (data) =>
        asJson(data).map((task) => ({
          id: task.id,
          title: task.title,
          priority: task.priority,
          dueDate: new Date(task.due_date).getTime(),
          inProgress: task.percent_done > 0 && task.percent_done < 1,
        })),
    },
  },
};

export default widget;
