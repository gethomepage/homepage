import { useContext } from "react";
import classNames from "classnames";

import { SettingsContext } from "utils/contexts/settings";
import ResolvedIcon from "components/resolvedicon";

export default function Item({ bookmark }) {
  const description = bookmark.description ?? new URL(bookmark.href).hostname;
  const { settings } = useContext(SettingsContext);

  return (
    <li key={bookmark.name} id={bookmark.id} className="bookmark" data-name={bookmark.name}>
      <a
        href={bookmark.href}
        title={bookmark.name}
        rel="noreferrer"
        target={bookmark.target ?? settings.target ?? "_blank"}
        className={classNames(
          settings.cardBlur !== undefined && `backdrop-blur${settings.cardBlur.length ? "-" : ""}${settings.cardBlur}`,
          "block w-full text-left cursor-pointer transition-all h-15 mb-3 rounded-md font-medium text-theme-700 dark:text-theme-200 dark:hover:text-theme-300 shadow-md shadow-theme-900/10 dark:shadow-theme-900/20 bg-theme-100/20 hover:bg-theme-300/20 dark:bg-white/5 dark:hover:bg-white/10",
        )}
      >
        <div className="flex">
          <div className="flex-shrink-0 flex items-center justify-center w-11 bg-theme-500/10 dark:bg-theme-900/50 text-theme-700 hover:text-theme-700 dark:text-theme-200 text-sm font-medium rounded-l-md bookmark-icon">
            {bookmark.icon && (
              <div className="flex-shrink-0 w-5 h-5">
                <ResolvedIcon icon={bookmark.icon} alt={bookmark.abbr} />
              </div>
            )}
            {!bookmark.icon && bookmark.abbr}
          </div>
          <div className="flex-1 flex items-center justify-between rounded-r-md bookmark-text">
            <div className="flex-1 grow pl-3 py-2 text-xs bookmark-name">{bookmark.name}</div>
            <div className="px-2 py-2 truncate text-theme-500 dark:text-theme-300 text-xs bookmark-description">
              {description}
            </div>
          </div>
        </div>
      </a>
    </li>
  );
}
