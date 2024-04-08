const groupTasksByProjectId = () => {
  const groupedTasks = {};
  tasks.forEach((task) => {
    if (!groupedTasks[task.project_id]) {
      groupedTasks[task.project_id] = [];
    }
    groupedTasks[task.project_id].push(task);
  });
  return Object.values(groupedTasks);
};
