import { useContext } from "react";
import classNames from "classnames";

import { TabContext } from "utils/contexts/tab";

export function slugify(tabName) {
  return tabName !== undefined ? encodeURIComponent(tabName.toString().replace(/\s+/g, "-").toLowerCase()) : "";
}

export default function Tab({ tab }) {
  const { activeTab, setActiveTab } = useContext(TabContext);

  return (
    <li
      key={tab}
      role="presentation"
      className={classNames("text-theme-700 dark:text-theme-200 relative h-10 w-full rounded-md flex")}
    >
      <button
        id={`${tab}-tab`}
        type="button"
        role="tab"
        aria-controls={`#${tab}`}
        aria-selected={activeTab === slugify(tab) ? "true" : "false"}
        className={classNames(
          "w-full rounded-md m-1",
          activeTab === slugify(tab)
            ? "bg-theme-300/20 dark:bg-white/10"
            : "hover:bg-theme-100/20 dark:hover:bg-white/5",
        )}
        onClick={() => {
          setActiveTab(slugify(tab));
          window.location.hash = `#${slugify(tab)}`;
        }}
      >
        {tab}
      </button>
    </li>
  );
}
