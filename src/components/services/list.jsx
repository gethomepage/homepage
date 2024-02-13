import classNames from "classnames";

import { columnMap } from "../../utils/layout/columns";

import Item from "components/services/item";

export default function List({ group, services, layout, useEqualHeights }) {
  return (
    <ul
      className={classNames(
        layout?.style === "row" ? `grid ${columnMap[layout?.columns]} gap-x-2` : "flex flex-col",
        "mt-3 services-list",
      )}
    >
      {services.map((service) => (
        <Item
          key={[service.container, service.app, service.name].filter((s) => s).join("-")}
          service={service}
          group={group}
          useEqualHeights={layout?.useEqualHeights ?? useEqualHeights}
        />
      ))}
    </ul>
  );
}
