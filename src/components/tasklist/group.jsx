import ErrorBoundary from "components/errorboundry";
import List from "components/tasklist/list";

export default function TaskListGroup({ group }) {
  return (
    <div key={group.name} className="flex-1">
      <h2 className="text-theme-800 dark:text-theme-300 text-xl font-medium">{group.name}</h2>
      <ErrorBoundary>
        <List tasklist={group.tasklist} />
      </ErrorBoundary>
    </div>
  );
}
