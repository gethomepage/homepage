import Item from "components/bookmarks/item";

export default function List({ bookmarks, target }) {
  return (
    <ul className="mt-3 flex flex-col">
      {bookmarks.map((bookmark) => (
        <Item key={bookmark.name} bookmark={bookmark} target={target} />
      ))}
    </ul>
  );
}
