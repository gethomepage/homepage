import { useContext } from "react";
import { SettingsContext } from "utils/contexts/settings";

import Error from "./error";

export default function Container({ error = false, children, service }) {
  const { settings } = useContext(SettingsContext);

  if (error) {
    if (settings.hideErrors || service.widget.hide_errors) {
      return null;
    }

    return <Error service={service} error={error} />;
  }

  const childrenArray = Array.isArray(children) ? children : [children];

  let visibleChildren = childrenArray;
  let fields = service?.widget?.fields;
  if (typeof fields === "string") fields = JSON.parse(service.widget.fields);
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
      }),
    );
  }

  return <div className="relative flex flex-row w-full service-container">{visibleChildren}</div>;
}
