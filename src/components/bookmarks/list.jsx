import classNames from "classnames";

import Item from "components/bookmarks/item";

const columnMap = [
  "grid-cols-1 md:grid-cols-1 lg:grid-cols-1",
  "grid-cols-1 md:grid-cols-1 lg:grid-cols-1",
  "grid-cols-1 md:grid-cols-2 lg:grid-cols-2",
  "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
  "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
  "grid-cols-1 md:grid-cols-2 lg:grid-cols-5",
  "grid-cols-1 md:grid-cols-2 lg:grid-cols-6",
  "grid-cols-1 md:grid-cols-2 lg:grid-cols-7",
  "grid-cols-1 md:grid-cols-2 lg:grid-cols-8",
];

export default function List({ bookmarks, layout }) {
  return (
    <ul
      className={classNames(
        layout?.style === "row" ? `grid ${columnMap[layout?.columns]} gap-x-2` : "flex flex-col",
        "mt-3"
      )}
    >
      {bookmarks.map((bookmark) => (
        <Item key={`${bookmark.name}-${bookmark.href}`} bookmark={bookmark} />
      ))}
    </ul>
  );
}
