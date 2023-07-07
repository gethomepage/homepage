import { useContext, useEffect, useRef, useState } from "react";

import Error from "./error";

import { SettingsContext } from "utils/contexts/settings";

export default function Container({ error = false, children, service }) {
  const { settings } = useContext(SettingsContext);
  const containerRef = useRef(null);
  const [childrensToSlice, setChildrensToSlice] = useState(0);

  const childrenArray = Array.isArray(children) ? children : [children];
  const numberOfChildren = childrenArray.filter((e) => e).length;
  // needed for taillwind class detection
  const subColumnsClassMap = [
    "grid-cols-1",
    "grid-cols-1",
    "@[12rem]:grid-cols-2",
    "@[12rem]:grid-cols-2 @[18rem]:grid-cols-3",
    "@[12rem]:grid-cols-2 @[18rem]:grid-cols-3 @[24rem]:grid-cols-4",
    "@[12rem]:grid-cols-2 @[18rem]:grid-cols-3 @[24rem]:grid-cols-4 @[30rem]:grid-cols-5",
    "@[12rem]:grid-cols-2 @[18rem]:grid-cols-3 @[24rem]:grid-cols-4 @[30rem]:grid-cols-5 @[36rem]:grid-cols-6",
    "@[12rem]:grid-cols-2 @[18rem]:grid-cols-3 @[24rem]:grid-cols-4 @[30rem]:grid-cols-5 @[36rem]:grid-cols-6 @[42rem]:grid-cols-7",
    "@[12rem]:grid-cols-2 @[18rem]:grid-cols-3 @[24rem]:grid-cols-4 @[30rem]:grid-cols-5 @[36rem]:grid-cols-6 @[42rem]:grid-cols-7 @[48rem]:grid-cols-8",
  ];

  let visibleChildren = childrenArray;
  const fields = service?.widget?.fields;
  const type = service?.widget?.type;
  if (fields && type) {
    // if the field contains a "." then it most likely contains a common loc value
    // logic now allows a fields array that can look like:
    // fields: [ "resources.cpu", "resources.mem", "field"]
    // or even
    // fields: [ "resources.cpu", "widget_type.field" ]
    visibleChildren = childrenArray?.filter((child) =>
      fields.some((field) => {
        let fullField = field;
        if (!field.includes(".")) {
          fullField = `${type}.${field}`;
        }
        return fullField === child?.props?.label;
      })
    );
  }

  const childrensTopRows = visibleChildren.filter((v) => v).slice(0, numberOfChildren - childrensToSlice);
  const childrensBottomRows = visibleChildren.filter((v) => v).slice(numberOfChildren - childrensToSlice);

  useEffect(() => {
    const resizeObserver = new ResizeObserver((entries) => {
      for (let i = 0; i < entries.length; i += 1) {
        const entry = entries[i];
        const { width } = entry.contentRect;
        const remSize = parseFloat(getComputedStyle(document.documentElement).fontSize);

        const remWidth = width / remSize;
        const maxChildrenFit = Math.floor(remWidth / 6);

        if (numberOfChildren > 1 && remWidth > 12) {
          if (numberOfChildren <= maxChildrenFit) return setChildrensToSlice(0);
          setChildrensToSlice(remWidth / 6 > 1 ? parseInt(numberOfChildren / maxChildrenFit, 10) : 0);
        }
      }
      return true;
    });

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, [numberOfChildren]);

  if (error) {
    if (settings.hideErrors || service.widget.hide_errors) {
      return null;
    }

    return <Error service={service} error={error} />;
  }

  return (
    <div className="@container w-full" ref={containerRef}>
      <div className={`relative grid  p-1 gap-2 w-full auto-rows-max	 ${subColumnsClassMap[numberOfChildren]}`}>
        {childrensTopRows}
        {childrensToSlice > 0 && (
          <div className="relative grid col-span-full gap-2 w-full auto-rows-max	grid-cols-[repeat(auto-fit,minmax(6rem,1fr))]">
            {childrensBottomRows}
          </div>
        )}
      </div>
    </div>
  );
}
