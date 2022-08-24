import List from "components/bookmarks/list";

export default function BookmarksGroup({ group }) {
  return (
    <div
      key={group.name}
      className="basis-full md:basis-1/2 lg:basis-1/3 xl:basis-1/4 flex-1 p-1"
    >
      <h2 className="text-theme-800 dark:text-theme-300 text-xl font-medium">
        {group.name}
      </h2>
      <List bookmarks={group.bookmarks} />
    </div>
  );
}
