import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
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
  "grid-cols-1 @[18rem]:grid-cols-2",
  "grid-cols-1 @[16rem]:grid-cols-2 @[24rem]:grid-cols-3",
  "grid-cols-1 @[14rem]:grid-cols-2 @[21rem]:grid-cols-3 @[28rem]:grid-cols-4",
  "grid-cols-1 @[14rem]:grid-cols-2 @[21rem]:grid-cols-3 @[28rem]:grid-cols-4 @[35rem]:grid-cols-5",
  "grid-cols-1 @[14rem]:grid-cols-2 @[21rem]:grid-cols-3 @[28rem]:grid-cols-4 @[35rem]:grid-cols-5 @[42rem]:grid-cols-6",
  "grid-cols-1 @[14rem]:grid-cols-2 @[21rem]:grid-cols-3 @[28rem]:grid-cols-4 @[35rem]:grid-cols-5 @[42rem]:grid-cols-6 [49rem]:grid-cols-7",
  "grid-cols-1 @[14rem]:grid-cols-2 @[21rem]:grid-cols-3 @[28rem]:grid-cols-4 @[35rem]:grid-cols-5 @[42rem]:grid-cols-6 [49rem]:grid-cols-7 [56rem]:grid-cols-8",
];

const itemRemSizeMap = [1, 1, 9, 8, 7, 7, 7, 7, 7];

function areArraysEqual(array1, array2) {
  if (array1.length === 0 && array2.length === 0) return true;

  if (array1.length !== array2.length) {
    return false;
  }
  const sortedArray1 = JSON.stringify(array1.slice().sort());
  const sortedArray2 = JSON.stringify(array2.slice().sort());

  return sortedArray1 === sortedArray2;
}

// eslint-disable-next-line react/display-name
const List = memo(
  ({ group, services, layout, isGroup = false, propagate = [], setPropagate, isStyleCombined = false }) => {
    const containerRef = useRef(null);
    const [childrensToSlice, setChildrensToSlice] = useState(0);
    const [servicesToPropagate, setServicesToPropagate] = useState({});

    const setPropagateWrapper = (id) => (value) => {
      if (areArraysEqual(servicesToPropagate[id] || [], value)) return;
      setServicesToPropagate((prev) => ({ ...prev, [id]: value }));
    };
    const numberOfServices = useMemo(() => [...propagate, ...services].filter((e) => e).length, [propagate, services]);
    const servicesTopRows = useMemo(
      () => [...propagate, ...services].filter((v) => v).slice(0, numberOfServices - childrensToSlice),
      [propagate, services, childrensToSlice, numberOfServices]
    );
    const servicesBottomRows = useMemo(
      () => [...propagate, ...services].filter((v) => v).slice(numberOfServices - childrensToSlice),
      [propagate, services, childrensToSlice, numberOfServices]
    );

    const setPropagateCallback = useCallback(setPropagate, [setPropagate]);

    useEffect(() => {
      if (typeof setPropagateCallback !== "function") return;
      setPropagateCallback(servicesBottomRows.length > 0 ? servicesBottomRows : []);
    }, [servicesBottomRows, setPropagateCallback]);

    const isStyleCombinedValue = useMemo(
      () => layout?.style === undefined || layout?.style === "grid-combine" || isStyleCombined,
      [layout?.style, isStyleCombined]
    );

    const servicesTopAfterPropagate = useMemo(() => {
      const groupedServiceIndexReverse = [...servicesTopRows].reverse().findIndex((e) => e.type === "grouped-service");
      const groupedServiceIndex = servicesTopRows.length - groupedServiceIndexReverse;
      const insertIndex = groupedServiceIndex || servicesTopRows.length;
      const servicesToAdd = servicesToPropagate[groupedServiceIndex] || [];
      return [
        ...servicesTopRows.slice(0, insertIndex),
        ...servicesToAdd,
        ...servicesTopRows.slice(insertIndex, servicesTopRows.length),
      ];
    }, [servicesTopRows, servicesToPropagate]);

    const [gridClassNameTop, gridClassNameBottom] = useMemo(() => {
      let gridClassName = isGroup ? subcolumnMap[layout.columns] : columnMap[layout?.columns];
      let gridClassNameB = isGroup
        ? subcolumnMap[servicesBottomRows?.length]
        : servicesBottomRows[servicesTopRows?.length];
      if (gridClassName) gridClassName = ` grid auto-rows-max ${gridClassName} gap-x-2`;
      if (gridClassNameB) gridClassNameB = ` grid auto-rows-max ${gridClassNameB} gap-x-2`;
      if (!gridClassName) gridClassName = " flex flex-wrap gap-x-2";
      if (!gridClassNameB) gridClassNameB = " flex flex-wrap gap-x-2";
      return [gridClassName, gridClassNameB];
    }, [layout?.columns, servicesBottomRows, servicesTopRows, isGroup]);

    useEffect(() => {
      const resizeObserver = new ResizeObserver((entries) => {
        for (let i = 0; i < entries.length; i += 1) {
          const entry = entries[i];
          const { width } = entry.contentRect;
          const remSize = parseFloat(getComputedStyle(document.documentElement).fontSize);

          const itemRemSize = itemRemSizeMap[parseInt(layout?.columns || 1, 10)];

          const remWidth = width / remSize;
          const maxChildrenFit = Math.floor(remWidth / itemRemSize);
          if (!itemRemSize || !maxChildrenFit || numberOfServices < maxChildrenFit || !(remWidth / itemRemSize > 1))
            return setChildrensToSlice(0);

          const toSlice = numberOfServices % Math.min(maxChildrenFit, layout.columns || 1);
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
    }, [numberOfServices, layout?.columns]);

    return (
      <ul
        className={classNames(
          layout?.style === "row" ? gridClassNameTop : "flex flex-col",
          isGroup ? undefined : "mt-3",
          "@container"
        )}
        ref={containerRef}
      >
        {servicesTopAfterPropagate.length > 0 &&
          servicesTopAfterPropagate.map((service, i) =>
            service.type === "grouped-service" ? (
              <List
                key={service.name}
                group={service.name}
                services={service.services}
                layout={{
                  ...layout,
                  columns: parseInt(service.name, 10) || 1,
                  style: "row",
                }}
                setPropagate={setPropagate || setPropagateWrapper(i + 1)}
                propagate={(isStyleCombinedValue && servicesToPropagate[i]) || []}
                isGroup
                isStyleCombined={isStyleCombinedValue}
              />
            ) : (
              <Item key={service.container ?? service.app ?? service.name} service={service} group={group} />
            )
          )}
        {servicesBottomRows.length > 0 && !isStyleCombined && (
          <ul
            className={classNames(
              layout?.style === "row" ? gridClassNameBottom : "flex flex-col",
              isGroup ? undefined : "mt-3",
              "col-span-full"
            )}
          >
            {servicesBottomRows.map((service, i) =>
              service.type === "grouped-service" ? (
                <List
                  key={service.name}
                  group={service.name}
                  services={service.services}
                  layout={{
                    columns: service.services?.length,
                    style: "row",
                  }}
                  setPropagate={setPropagate || setPropagateWrapper(i + 1)}
                  propagate={servicesToPropagate[i] || []}
                  isGroup
                  isStyleCombined={isStyleCombinedValue}
                  isDeep={isGroup}
                />
              ) : (
                <Item key={service.container ?? service.app ?? service.name} service={service} group={group} />
              )
            )}
            {}
          </ul>
        )}
      </ul>
    );
  }
);
export default List;
