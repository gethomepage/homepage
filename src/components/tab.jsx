import { useContext } from "react";
import classNames from "classnames";

import { TabContext } from "utils/contexts/tab";

export default function Tab({ tab }) {
  const { activeTab, setActiveTab } = useContext(TabContext);

  return (
    <li key={tab} role="presentation"
      className={classNames(
        "text-theme-700 dark:text-theme-200 relative h-8 w-full rounded-md flex m-1",
        )}>
      <button id={`${tab}-tab`} type="button" role="tab"
              aria-controls={`#${tab}`} aria-selected={activeTab === tab ? "true" : "false"}
              className={classNames(
                "h-full w-full rounded-md",
                activeTab === tab ? "bg-theme-300/20 dark:bg-white/10" : "hover:bg-theme-100/20 dark:hover:bg-white/5",
              )}
              onClick={() => { setActiveTab(tab); window.location.hash = `#${tab}`; }}
      >{tab}</button>
    </li>
  );
}
