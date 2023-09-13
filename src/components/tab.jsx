import { useContext } from "react";
import classNames from "classnames";

import { SettingsContext } from "utils/contexts/settings";
import { TabContext } from "utils/contexts/tab";

export default function Tab({ tab }) {
  const { settings } = useContext(SettingsContext);
  const { activeTab, setActiveTab } = useContext(TabContext);

  return (
    <li key={tab} role="presentation"
      className={classNames(
        "text-theme-700 dark:text-theme-200 relative h-12 w-full rounded-md flex m-1 shadow-md shadow-theme-900/10 dark:shadow-theme-900/20",
        activeTab === tab ? "bg-theme-700/20 dark:bg-theme-700/20" : "bg-theme-500/20 dark:bg-theme-500/20",
        settings.cardBlur !== undefined && `backdrop-blur${settings.cardBlur.length ? '-': "" }${settings.cardBlur}`
      )}>
      <button id={`${tab}-tab`} type="button" role="tab"
              aria-controls={`#${tab}`} aria-selected={activeTab === tab ? "true" : "false"}
              className="h-full w-full rounded-md hover:bg-white/20 dark:hover:bg-white/20 dark:hover:text-theme-300"
              onClick={() => { setActiveTab(tab); window.location.hash = `#${tab}`; }}
      >{tab}</button>
    </li>
  );
}
