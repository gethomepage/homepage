import { useState } from "react";

import ErrorBoundary from "components/errorboundry";
import List from "components/tasklist/list";
import TaskBox from "components/tasklist/taskbox";

export default function TaskListGroup({groupDetail, groupUpdate}) {
  const [taskCount, setTaskCount] = useState(0)
  const [group, setGroup] = useState(groupDetail)

  const groupName = Object.keys(group)[0]
  const groupTasks = Object.values(group)[0]

  const addTask = (value) => {
    const newTask = {
        title: value,
        complete: false
    };
    groupTasks.push(newTask)

    setGroup(group);
    setTaskCount(groupTasks.length)
    groupUpdate();
  }

  const listUpdate = () => {
    setGroup(group)
    groupUpdate()
  }

  return (
    <div key={taskCount} className="flex-1">
      <h2 className="text-theme-800 dark:text-theme-300 text-xl font-medium">{groupName}</h2>
      <ErrorBoundary>
        <List listDetail={groupTasks} listUpdate={listUpdate} />
      </ErrorBoundary>
      <ErrorBoundary>
        <TaskBox submitAction={addTask} />
      </ErrorBoundary>
    </div>
  );
}
