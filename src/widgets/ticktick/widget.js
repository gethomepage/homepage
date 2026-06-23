import ticktickProxyHandler from "./proxy";

import { asJson } from "utils/proxy/api-helpers";

const widget = {
  api: "https://api.ticktick.com/open/v1/{endpoint}",
  proxyHandler: ticktickProxyHandler,
  mappings: {
    tasks: {
      endpoint: "project/{projectId}/data",
      map: (data) => {
        const json = asJson(data);
        return (json.tasks ?? []).map((task) => ({
          id: task.id,
          title: task.title,
          priority: task.priority ?? 0,
          dueDate: task.dueDate ?? null,
          isCompleted: task.status === 2,
        }));
      },
    },
    closedTasks: {
      endpoint: "task/completed",
      map: (data) => {
        const tasks = asJson(data);
        return Array.isArray(tasks)
          ? tasks.map((task) => ({
              id: task.id,
              title: task.title,
              priority: task.priority ?? 0,
              dueDate: task.completedTime ?? task.dueDate ?? null,
              isCompleted: true,
            }))
          : [];
      },
    },
  },
};

export default widget;
