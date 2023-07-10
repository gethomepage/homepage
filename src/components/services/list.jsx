import classNames from "classnames";

import Item from "components/services/item";
import { useEffect, useRef, useState } from "react";

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
  "grid-cols-1 @[18rem]:grid-cols-2",
  "grid-cols-1 @[16rem]:grid-cols-2 @[24rem]:grid-cols-3",
  "grid-cols-1 @[14rem]:grid-cols-2 @[21rem]:grid-cols-3 @[28rem]:grid-cols-4",
  "grid-cols-1 @[14rem]:grid-cols-2 @[21rem]:grid-cols-3 @[28rem]:grid-cols-4 @[35rem]:grid-cols-5",
  "grid-cols-1 @[14rem]:grid-cols-2 @[21rem]:grid-cols-3 @[28rem]:grid-cols-4 @[35rem]:grid-cols-5 @[42rem]:grid-cols-6",
  "grid-cols-1 @[14rem]:grid-cols-2 @[21rem]:grid-cols-3 @[28rem]:grid-cols-4 @[35rem]:grid-cols-5 @[42rem]:grid-cols-6 [49rem]:grid-cols-7",
  "grid-cols-1 @[14rem]:grid-cols-2 @[21rem]:grid-cols-3 @[28rem]:grid-cols-4 @[35rem]:grid-cols-5 @[42rem]:grid-cols-6 [49rem]:grid-cols-7 [56rem]:grid-cols-8",
];

const itemRemSizeMap = [1, 1, 9, 8, 7, 7, 7, 7, 7];

export default function List({ group, services, layout, isGroup = false }) {
  const containerRef = useRef(null);
  const [childrensToSlice, setChildrensToSlice] = useState(0);

  const numberOfServices = services.filter((e) => e).length;
  const servicesTopRows = services.filter((v) => v).slice(0, numberOfServices - childrensToSlice);
  const servicesBottomRows = services.filter((v) => v).slice(numberOfServices - childrensToSlice);
  if (servicesBottomRows.length > 0) console.log(servicesBottomRows);

  let gridClassName = isGroup ? subcolumnMap[layout.columns] : columnMap[layout?.columns];
  let gridClassNameBottom = isGroup
    ? subcolumnMap[servicesBottomRows?.length]
    : servicesBottomRows[servicesTopRows?.length];
  if (gridClassName) gridClassName = ` grid auto-rows-max ${gridClassName} gap-x-2`;
  if (gridClassNameBottom) gridClassNameBottom = ` grid auto-rows-max ${gridClassNameBottom} gap-x-2`;
  if (!gridClassName) gridClassName = " flex flex-wrap gap-x-2";
  if (!gridClassNameBottom) gridClassNameBottom = " flex flex-wrap gap-x-2";

  useEffect(() => {
    const resizeObserver = new ResizeObserver((entries) => {
      for (let i = 0; i < entries.length; i += 1) {
        const entry = entries[i];
        const { width } = entry.contentRect;
        const remSize = parseFloat(getComputedStyle(document.documentElement).fontSize);

        const itemRemSize = itemRemSizeMap[parseInt(layout?.columns, 10)];

        const remWidth = width / remSize;
        const maxChildrenFit = Math.floor(remWidth / itemRemSize);

        if (numberOfServices < maxChildrenFit) return setChildrensToSlice(0);
        const toSlice =
          remWidth / itemRemSize > 1 && numberOfServices > Math.min(maxChildrenFit, layout.columns)
            ? numberOfServices % Math.min(maxChildrenFit, layout.columns)
            : 0;
        setChildrensToSlice(toSlice);
      }
      return true;
    });

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, [numberOfServices]);

  return (
    <ul
      className={classNames(
        layout?.style === "row" ? gridClassName : "flex flex-col",
        isGroup ? undefined : "mt-3",
        "@container"
      )}
      ref={containerRef}
    >
      {servicesTopRows.length > 0 &&
        servicesTopRows.map((service) =>
          service.type === "grouped-service" ? (
            <List
              key={service.name}
              group={service.name}
              services={service.services}
              layout={{
                columns: parseInt(service.name, 10) || 1,
                style: "row",
              }}
              isGroup
            />
          ) : (
            <Item key={service.container ?? service.app ?? service.name} service={service} group={group} />
          )
        )}
      {servicesBottomRows.length > 0 && (
        <ul
          className={classNames(
            layout?.style === "row" ? gridClassNameBottom : "flex flex-col",
            isGroup ? undefined : "mt-3",
            "col-span-full"
          )}
        >
          {servicesBottomRows.map((service) =>
            service.type === "grouped-service" ? (
              <List
                key={service.name}
                group={service.name}
                services={service.services}
                layout={{
                  columns: service.services?.length,
                  style: "row",
                }}
                isGroup
              />
            ) : (
              <Item key={service.container ?? service.app ?? service.name} service={service} group={group} />
            )
          )}
        </ul>
      )}
    </ul>
  );
}
