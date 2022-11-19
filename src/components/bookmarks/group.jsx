import ErrorBoundary from "components/errorboundry";
import List from "components/bookmarks/list";

export default function BookmarksGroup({ group }) {
  return (
    <div key={group.name} className="flex-1">
      <h2 className="text-theme-800 dark:text-theme-300 text-xl font-medium">{group.name}</h2>
      <ErrorBoundary>
        <List bookmarks={group.bookmarks} />
      </ErrorBoundary>
    </div>
  );
}
