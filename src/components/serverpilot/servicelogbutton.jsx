import { useState } from "react";
import classNames from "classnames";
import LogPanel from "./logpanel";

export default function ServiceLogButton({ containerName, server, allContainers = [] }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={classNames(
          "flex items-center gap-1 px-2 py-1 text-xs rounded transition-all",
          "text-theme-500 dark:text-theme-400 hover:text-theme-700 dark:hover:text-theme-300",
          "border border-theme-300 dark:border-theme-600 hover:border-theme-500 dark:hover:border-theme-500"
        )}
        title="View logs"
      >
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <span>Logs</span>
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-theme-100 dark:bg-theme-900 rounded-lg shadow-xl w-[90vw] max-w-4xl max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between px-4 py-3 border-b border-theme-200 dark:border-theme-700">
              <h2 className="text-sm font-medium text-theme-700 dark:text-theme-200">
                Docker Logs — {allContainers.length > 0 ? "All Containers" : containerName}
              </h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="text-theme-400 hover:text-theme-600 dark:hover:text-theme-300 text-xl leading-none"
              >
                ×
              </button>
            </div>
            <div className="flex-1 overflow-auto p-4">
              <LogPanel
                containerName={containerName}
                server={server}
                allContainers={allContainers}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}