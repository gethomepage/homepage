import classNames from "classnames";

import { columnMap } from "../../utils/layout/columns";

import Item from "components/services/item";
import Group from "components/services/group";

export default function List({ group, subgroups = [], services, layout, useEqualHeights }) {
  return (
    <>
      <ul
        className={classNames(
          layout?.style === "row" ? `grid ${columnMap[layout?.columns]} gap-x-2` : "flex flex-col",
          layout?.header !== false ? "mt-3" : "",
          "services-list",
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
      {subgroups
        .filter((subgroup) => subgroup != [])
        .map((subgroup) => (
          <Group
            group={subgroup}
            services={subgroup}
            subgroups={subgroup.subgroups}
            layout={subgroup}
            useEqualHeights={useEqualHeights}
            isSubgroup={true}
          />
        ))}
    </>
  );
}
