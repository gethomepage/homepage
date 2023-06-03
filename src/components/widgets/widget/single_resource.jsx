import UsageBar from "../resources/usage-bar";

import WidgetIcon from "./widget_icon";
import ResourceValue from "./resource_value";
import ResourceLabel from "./resource_label";
import Raw from "./raw";

export default function SingleResource({ children, key, expanded = false }) {
  const values = children.filter(child => child.type === ResourceValue);
  const labels = children.filter(child => child.type === ResourceLabel);

  return <div key={key} className="flex-none flex flex-row items-center mr-3 py-1.5">
    {children.find(child => child.type === WidgetIcon)}
    <div className="flex flex-col ml-3 text-left min-w-[85px]">
      <div className="text-theme-800 dark:text-theme-200 text-xs flex flex-row justify-between">
        {values.pop()}
        {labels.pop()}
      </div>
      { expanded && <div className="text-theme-800 dark:text-theme-200 text-xs flex flex-row justify-between">
          {values.pop()}
          {labels.pop()}
        </div>
      }
      {children.find(child => child.type === UsageBar)}
    </div>
    {children.find(child => child.type === Raw)}
  </div>;
}
