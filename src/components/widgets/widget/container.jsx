import classNames from "classnames";

import WidgetIcon from "./widget_icon";
import PrimaryText from "./primary_text";
import SecondaryText from "./secondary_text";
import Raw from "./raw";

export function getAllClasses(options, additionalClassNames = '') {
  return classNames(
    "flex flex-col justify-center first:ml-0 ml-4 mr-2",
    additionalClassNames,
    options?.style === "boxedWidgets" && " ml-4 mt-2 m:mb-0 rounded-md shadow-md shadow-theme-900/10 dark:shadow-theme-900/20 bg-theme-100/20 dark:bg-white/5 p-2 pl-3",
  );
}

export function getInnerBlock(children) {
  // children won't be an array if it's Raw component
  return Array.isArray(children) && <div className="flex flex-row items-center justify-end">
    <div className="flex flex-col items-center">{children.find(child => child.type === WidgetIcon)}</div>
    <div className="flex flex-col ml-3 text-left">
      <span className="text-theme-800 dark:text-theme-200 text-sm">{children.find(child => child.type === PrimaryText)}</span>
      <span className="text-theme-800 dark:text-theme-200 text-xs">{children.find(child => child.type === SecondaryText)}</span>
    </div>
  </div>;
}

export function getBottomBlock(children) {
  if (children.type !== Raw) {
    return children.find(child => child.type === Raw) || [];
  }

  return [children];
}

export default function Container({ children = [], options, additionalClassNames = '' }) {
  return (
    <div className={getAllClasses(options, additionalClassNames)}>
      {getInnerBlock(children)}
      {getBottomBlock(children)}
    </div>
  );
}
