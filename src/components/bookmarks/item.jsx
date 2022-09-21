export default function Item({ bookmark, target = "_blank" }) {
  const { hostname } = new URL(bookmark.href);

  return (
    <li key={bookmark.name}>
      <a
        href={bookmark.href}
        title={bookmark.name}
        target={target}
        className="w-full text-left mb-3 cursor-pointer rounded-md font-medium text-theme-700 hover:text-theme-700 dark:text-theme-200 dark:hover:text-theme-300 shadow-md shadow-black/10 dark:shadow-black/20 bg-white/50 hover:bg-theme-300/10 dark:bg-white/10 dark:hover:bg-white/20"
      >
        <div className="flex">
          <div className="flex-shrink-0 flex items-center justify-center w-11 bg-theme-500/10 dark:bg-theme-900/50 text-theme-700 hover:text-theme-700 dark:text-theme-200 text-sm font-medium rounded-l-md">
            {bookmark.abbr}
          </div>
          <div className="flex-1 flex items-center justify-between rounded-r-md ">
            <div className="flex-1 grow pl-3 py-2 text-xs">{bookmark.name}</div>
            <div className="px-2 py-2 truncate text-theme-500 dark:text-theme-400 opacity-50 text-xs">{hostname}</div>
          </div>
        </div>
      </a>
    </li>
  );
}
