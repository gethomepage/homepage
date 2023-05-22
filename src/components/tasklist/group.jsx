import { useState } from "react";

import ErrorBoundary from "components/errorboundry";
import List from "components/tasklist/list";

export default function TaskListGroup({groupDetail, groupUpdate}) {
  const [group, setGroup] = useState(groupDetail)
  const groupName = Object.keys(group)[0]
  const groupTasks = Object.values(group)[0]

  const listUpdate = () => {
    setGroup(group)
    groupUpdate()
  }
  return (
    <div key={groupName} className="flex-1">
      <h2 className="text-theme-800 dark:text-theme-300 text-xl font-medium">{groupName}</h2>
      <ErrorBoundary>
        <List listDetail={groupTasks} listUpdate={listUpdate} />
      </ErrorBoundary>
    </div>
  );
}
