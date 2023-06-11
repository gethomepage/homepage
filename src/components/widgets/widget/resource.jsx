import UsageBar from "../resources/usage-bar";

export default function Resource({ children, icon, value, label, expandedValue, expandedLabel, percentage, key, expanded = false }) {
  const Icon = icon;

  return <div key={key} className="flex-none flex flex-row items-center mr-3 py-1.5">
    <Icon className="text-theme-800 dark:text-theme-200 w-5 h-5"/>
    <div className="flex flex-col ml-3 text-left min-w-[85px]">
      <div className="text-theme-800 dark:text-theme-200 text-xs flex flex-row justify-between">
        <div className="pl-0.5">{value}</div>
        <div className="pr-1">{label}</div>
      </div>
      { expanded && <div className="text-theme-800 dark:text-theme-200 text-xs flex flex-row justify-between">
          <div className="pl-0.5">{expandedValue}</div>
          <div className="pr-1">{expandedLabel}</div>
        </div>
      }
      { percentage && <UsageBar percent={percentage} /> }
      { children }
    </div>
  </div>;
}
