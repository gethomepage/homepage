import classNames from "classnames";
import Item from "components/services/item";
import { useContext } from "react";
import { LabelFilterContext } from "utils/contexts/label-filter";

import { columnMap } from "../../utils/layout/columns";

export default function List({ groupName, services, layout, useEqualHeights, header }) {
  const { activeLabelSlug } = useContext(LabelFilterContext);

  const filteredServices = activeLabelSlug
    ? services.filter((service) => {
        return service.labels && service.labels.some((label) => label.slug === activeLabelSlug);
      })
    : services;

  return (
    <ul
      className={classNames(
        layout?.style === "row" ? `grid ${columnMap[layout?.columns]} gap-x-2` : "flex flex-col",
        header ? "mt-3" : "",
        "services-list",
      )}
    >
      {filteredServices.map((service) => (
        <Item
          key={[service.container, service.app, service.name].filter((s) => s).join("-")}
          service={service}
          groupName={groupName}
          useEqualHeights={layout?.useEqualHeights ?? useEqualHeights}
        />
      ))}
    </ul>
  );
}
