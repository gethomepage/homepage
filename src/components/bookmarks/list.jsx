import classNames from "classnames";

import { columnMap } from "../../utils/layout/columns";

import Item from "components/bookmarks/item";

export default function List({ bookmarks, layout }) {
  return (
    <ul
      className={classNames(
        layout?.style === "row" ? `grid ${columnMap[layout?.columns]} gap-x-2` : "flex flex-col",
        "mt-3 bookmark-list",
      )}
    >
      {bookmarks.map((bookmark) => (
        <Item key={`${bookmark.name}-${bookmark.href}`} bookmark={bookmark} />
      ))}
    </ul>
  );
}
