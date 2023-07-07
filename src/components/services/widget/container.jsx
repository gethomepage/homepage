import { useContext } from "react";

import Error from "./error";

import { SettingsContext } from "utils/contexts/settings";

export default function Container({ error = false, children, service }) {
  const { settings } = useContext(SettingsContext);

  if (error) {
    if (settings.hideErrors || service.widget.hide_errors) {
      return null;
    }

    return <Error service={service} error={error} />;
  }

  const childrenArray = Array.isArray(children) ? children : [children];
  const numberOfChildren = childrenArray.filter((e) => e).length;
  // needed for taillwind class detection
  const subColumnsClassMap = [
    "",
    "",
    "@[12rem]:cols-2",
    "@[12rem]:cols-2 @[18rem]:cols-3",
    "@[12rem]:cols-2 @[18rem]:cols-3 @[24rem]:cols-4",
    "@[12rem]:cols-2 @[18rem]:cols-3 @[24rem]:cols-4 @[30rem]:cols-5",
    "@[12rem]:cols-2 @[18rem]:cols-3 @[24rem]:cols-4 @[30rem]:cols-5 @[36rem]:cols-6",
    "@[12rem]:cols-2 @[18rem]:cols-3 @[24rem]:cols-4 @[30rem]:cols-5 @[36rem]:cols-6 @[42rem]:cols-7",
    "@[12rem]:cols-2 @[18rem]:cols-3 @[24rem]:cols-4 @[30rem]:cols-5 @[36rem]:cols-6 @[42rem]:cols-7 @[48rem]:cols-8",
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

  return (
    <div className={`relative grid  p-1 gap-2 w-full auto-rows-max	grid-cols-[repeat(auto-fit,minmax(6rem,1fr))]`}>
      {visibleChildren}
    </div>
  );
}
