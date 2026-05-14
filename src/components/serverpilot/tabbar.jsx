import classNames from "classnames";
import { useState } from "react";

export default function TabBar({ tabs, onTabClose, onNewTab }) {
  const [overflowOpen, setOverflowOpen] = useState(false);

  const visibleTabs = tabs.slice(0, 8);
  const hiddenTabs = tabs.slice(8);

  return (
    <div className="flex items-center border-b border-theme-200 dark:border-theme-800 bg-theme-50 dark:bg-theme-900 tab-bar">
      <div className="flex items-center overflow-x-auto scrollbar-thin">
        {visibleTabs.map((tab) => (
          <Tab key={tab.id} tab={tab} onClose={onTabClose} />
        ))}
        {hiddenTabs.length > 0 && (
          <div className="relative">
            <button
              type="button"
              onClick={() => setOverflowOpen(!overflowOpen)}
              className="px-2 py-1 text-xs text-theme-500 hover:text-theme-700 dark:hover:text-theme-300"
            >
              +{hiddenTabs.length} more
            </button>
            {overflowOpen && (
              <div className="absolute top-full left-0 z-50 mt-1 bg-theme-100 dark:bg-theme-800 border border-theme-200 dark:border-theme-700 rounded-md shadow-lg min-w-[200px]">
                {hiddenTabs.map((tab) => (
                  <Tab key={tab.id} tab={tab} onClose={onTabClose} compact />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
      <button
        type="button"
        onClick={onNewTab}
        className="ml-2 px-2 py-1 text-xs text-theme-400 hover:text-theme-600 dark:hover:text-theme-300 transition-colors"
        aria-label="New tab"
      >
        +
      </button>
      <style>{`
        .tab-bar { min-height: 36px; }
        .scrollbar-thin::-webkit-scrollbar { height: 4px; }
        .scrollbar-thin::-webkit-scrollbar-track { background: transparent; }
        .scrollbar-thin::-webkit-scrollbar-thumb { background: #d1d5db; border-radius: 2px; }
        .dark .scrollbar-thin::-webkit-scrollbar-thumb { background: #374151; }
      `}</style>
    </div>
  );
}

function Tab({ tab, onClose, compact }) {
  return (
    <div
      className={classNames(
        "group flex items-center gap-1 px-3 py-2 text-sm border-r border-theme-200 dark:border-theme-700 cursor-pointer select-none transition-colors",
        tab.active
          ? "bg-theme-100 dark:bg-theme-800 text-theme-700 dark:text-theme-200 border-b-2 border-b-theme-500"
          : "text-theme-500 dark:text-theme-400 hover:bg-theme-50 dark:hover:bg-theme-800/50",
        compact ? "px-2 py-1 text-xs" : ""
      )}
      onClick={tab.onClick}
      onMouseDown={(e) => {
        if (e.button === 1) {
          e.preventDefault();
          onClose(tab.id);
        }
      }}
      role="tab"
      aria-selected={tab.active}
    >
      {tab.favicon && (
        <img src={tab.favicon} alt="" className="w-4 h-4 rounded-sm" />
      )}
      <span className="truncate max-w-[120px]">{tab.title}</span>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onClose(tab.id);
        }}
        className="ml-1 opacity-0 group-hover:opacity-100 text-theme-400 hover:text-theme-600 dark:hover:text-theme-300 text-xs leading-none p-0.5 rounded transition-opacity"
        aria-label="Close tab"
      >
        ×
      </button>
    </div>
  );
}