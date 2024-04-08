import credentialedProxyHandler from "utils/proxy/handlers/credentialed";

const widget = {
  api: "https://api.todoist.com/rest/v2/{endpoint}",
  proxyHandler: credentialedProxyHandler,

  mappings: {
    getAllActiveTasks: {
      method: "GET",
      endpoint: "tasks",
    },
    getTasksWithLabel: {
      method: "GET",
      endpoint: "tasks",
      params: ["label"]
    },
  },
};

export default widget;

