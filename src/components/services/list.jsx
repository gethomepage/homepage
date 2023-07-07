import classNames from "classnames";

import Item from "components/services/item";

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

const subcolumnMap = [
  "grid-cols-1",
  "grid-cols-1",
  "grid-cols-[repeat(auto-fit,minmax(11rem,1fr))]",
  "grid-cols-[repeat(auto-fit,minmax(9rem,1fr))]",
  "grid-cols-[repeat(auto-fit,minmax(7rem,1fr))]",
  "grid-cols-[repeat(auto-fit,minmax(7rem,1fr))]",
  "grid-cols-[repeat(auto-fit,minmax(7rem,1fr))]",
  "grid-cols-[repeat(auto-fit,minmax(7rem,1fr))]",
  "grid-cols-[repeat(auto-fit,minmax(7rem,1fr))]",
];

export default function List({ group, services, layout, isGroup = false }) {
  return (
    <ul
      className={classNames(
        layout?.style === "row"
          ? `grid auto-rows-max ${isGroup ? subcolumnMap[layout?.columns] : columnMap[layout?.columns]} gap-x-2`
          : "flex flex-col",
        isGroup ? undefined : "mt-3"
      )}
    >
      {services.map((service) =>
        service.type === "grouped-service" ? (
          <List
            key={service.name}
            group={group}
            services={service.services}
            layout={{ columns: parseInt(service.name, 10) || service.services.length, style: "row" }}
            isGroup
          />
        ) : (
          <Item key={service.container ?? service.app ?? service.name} service={service} group={group} />
        )
      )}
    </ul>
  );
}
