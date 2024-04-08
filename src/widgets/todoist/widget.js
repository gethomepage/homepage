import credentialedProxyHandler from "utils/proxy/handlers/credentialed";

const widget = {
  api: "https://api.todoist.com/rest/v2/{endpoint}",
  proxyHandler: credentialedProxyHandler,

  mappings: {
    getAllActiveTasks: {
      method: "GET",
      endpoint: "tasks",
    },
    getAllProjects: {
      method: "GET",
      endpoint: "projects",
    },
    getTasksWithCustomFilter: {
      method: "GET",
      endpoint: "tasks",
      params: ["filter"]
    },
    getTasksWithLabel: {
      method: "GET",
      endpoint: "tasks",
      params: ["label"]
    },
    getTasksWithProject: {
      method: "GET",
      endpoint: "tasks",
      params: ["project_id"]
    },
  },
};

export default widget;

