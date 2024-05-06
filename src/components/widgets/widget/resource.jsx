import UsageBar from "../resources/usage-bar";

export default function Resource({
  children,
  icon,
  iconChildren,
  value,
  label,
  expandedValue = "",
  expandedLabel = "",
  percentage,
  expanded = false,
  additionalClassNames = "",
}) {
  const Icon = icon;

  return (
    <div
      className={`flex-none flex flex-row items-center mr-3 py-1.5 information-widget-resource ${additionalClassNames}`}
    >
      <div className="flex flex-col items-center">
        <Icon className="text-theme-800 dark:text-theme-200 w-5 h-5 resource-icon" />
        {iconChildren}
      </div>
      <div className={`flex flex-col ml-3 text-left min-w-[85px] ${expanded ? " expanded" : ""}`}>
        <div className="text-theme-800 dark:text-theme-200 text-xs flex flex-row justify-between">
          <div className="pl-0.5">{value}</div>
          <div className="pr-1">{label}</div>
        </div>
        {expanded && (
          <div className="text-theme-800 dark:text-theme-200 text-xs flex flex-row justify-between">
            <div className="pl-0.5">{expandedValue}</div>
            <div className="pr-1">{expandedLabel}</div>
          </div>
        )}
        {percentage >= 0 && <UsageBar percent={percentage} additionalClassNames="resource-usage" />}
        {children}
      </div>
    </div>
  );
}
