import classNames from "classnames";
import { useContext } from "react";

import WidgetIcon from "./widget_icon";
import PrimaryText from "./primary_text";
import SecondaryText from "./secondary_text";
import Raw from "./raw";

import { SettingsContext } from "utils/contexts/settings";

export function getAllClasses(options, additionalClassNames = "") {
  if (options?.style?.header === "boxedWidgets") {
    if (options?.style?.cardBlur !== undefined) {
      // eslint-disable-next-line no-param-reassign
      additionalClassNames = [
        additionalClassNames,
        `backdrop-blur${options.style.cardBlur.length ? "-" : ""}${options.style.cardBlur}`,
      ].join(" ");
    }

    return classNames(
      "flex flex-col justify-center",
      "mt-2 m:mb-0 rounded-md shadow-md shadow-theme-900/10 dark:shadow-theme-900/20 bg-theme-100/20 dark:bg-white/5 p-2 pl-3 pr-3",
      additionalClassNames,
    );
  }

  let widgetAlignedClasses = "flex flex-col max-w:full sm:basis-auto self-center grow-0 flex-wrap";
  if (options?.style?.isRightAligned) {
    widgetAlignedClasses = "flex flex-col justify-center";
  }

  return classNames(widgetAlignedClasses, additionalClassNames);
}

export function getInnerBlock(children) {
  // children won't be an array if it's Raw component
  return (
    Array.isArray(children) && (
      <div className="flex flex-row items-center justify-end widget-inner">
        <div className="flex flex-col items-center widget-inner-icon">
          {children.find((child) => child.type === WidgetIcon)}
        </div>
        <div className="flex flex-col ml-3 text-left widget-inner-text">
          {children.find((child) => child.type === PrimaryText)}
          {children.find((child) => child.type === SecondaryText)}
        </div>
      </div>
    )
  );
}

export function getBottomBlock(children) {
  if (children.type !== Raw) {
    return children.find((child) => child.type === Raw) || [];
  }

  return [children];
}

export default function Container({ children = [], options, additionalClassNames = "" }) {
  const { settings } = useContext(SettingsContext);
  return options?.href ? (
    <a
      href={options.href}
      target={options.target ?? settings.target ?? "_blank"}
      className={getAllClasses(options, `${additionalClassNames} widget-container`)}
    >
      {getInnerBlock(children)}
      {getBottomBlock(children)}
    </a>
  ) : (
    <div className={getAllClasses(options, `${additionalClassNames} widget-container`)}>
      {getInnerBlock(children)}
      {getBottomBlock(children)}
    </div>
  );
}
