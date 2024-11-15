import classNames from "classnames";

import { columnMap } from "../../utils/layout/columns";

import Item from "components/favicons/item";

export default function List({ favicons, layout }) {
  return (
    <ul
      className="favicon-list"
    >
      {favicons.map((favicon) => (
        <Item key={`${favicon.name}-${favicon.href}`} favicon={favicon} />
      ))}
    </ul>
  );
}
