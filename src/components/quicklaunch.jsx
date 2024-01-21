import { useTranslation } from "react-i18next";
import { useEffect, useState, useRef, useCallback, useContext } from "react";
import classNames from "classnames";

import ResolvedIcon from "./resolvedicon";

import { SettingsContext } from "utils/contexts/settings";

export default function QuickLaunch({
  servicesAndBookmarks,
  searchString,
  setSearchString,
  isOpen,
  close,
  searchProvider,
}) {
  const { t } = useTranslation();
  const { settings } = useContext(SettingsContext);
  const { searchDescriptions, hideVisitURL } = settings?.quicklaunch
    ? settings.quicklaunch
    : { searchDescriptions: false, hideVisitURL: false };

  const searchField = useRef();

  const [results, setResults] = useState([]);
  const [currentItemIndex, setCurrentItemIndex] = useState(null);
  const [url, setUrl] = useState(null);

  function openCurrentItem(newWindow) {
    const result = results[currentItemIndex];
    window.open(result.href, newWindow ? "_blank" : result.target ?? settings.target ?? "_blank", "noreferrer");
  }

  const closeAndReset = useCallback(() => {
    close(false);
    setTimeout(() => {
      setSearchString("");
      setCurrentItemIndex(null);
    }, 200); // delay a little for animations
  }, [close, setSearchString, setCurrentItemIndex]);

  function handleSearchChange(event) {
    const rawSearchString = event.target.value.toLowerCase();
    try {
      if (!/.+[.:].+/g.test(rawSearchString)) throw new Error(); // basic test for probably a url
      let urlString = rawSearchString;
      if (urlString.indexOf("http") !== 0) urlString = `https://${rawSearchString}`;
      setUrl(new URL(urlString)); // basic validation
    } catch (e) {
      setUrl(null);
    }
    setSearchString(rawSearchString);
  }

  function handleSearchKeyDown(event) {
    if (!isOpen) return;

    if (event.key === "Escape") {
      closeAndReset();
      event.preventDefault();
    } else if (event.key === "Enter" && results.length) {
      closeAndReset();
      openCurrentItem(event.metaKey);
    } else if (event.key === "ArrowDown" && results[currentItemIndex + 1]) {
      setCurrentItemIndex(currentItemIndex + 1);
      event.preventDefault();
    } else if (event.key === "ArrowUp" && currentItemIndex > 0) {
      setCurrentItemIndex(currentItemIndex - 1);
      event.preventDefault();
    }
  }

  function handleItemHover(event) {
    setCurrentItemIndex(parseInt(event.target?.dataset?.index, 10));
  }

  function handleItemClick(event) {
    closeAndReset();
    openCurrentItem(event.metaKey);
  }

  function handleItemKeyDown(event) {
    if (!isOpen) return;

    // native button handles other keys
    if (event.key === "Escape") {
      closeAndReset();
      event.preventDefault();
    }
  }

  useEffect(() => {
    if (searchString.length === 0) setResults([]);
    else {
      let newResults = servicesAndBookmarks.filter((r) => {
        const nameMatch = r.name.toLowerCase().includes(searchString);
        let descriptionMatch;
        if (searchDescriptions) {
          descriptionMatch = r.description?.toLowerCase().includes(searchString);
          r.priority = nameMatch ? 2 * +nameMatch : +descriptionMatch; // eslint-disable-line no-param-reassign
        }
        return nameMatch || descriptionMatch;
      });

      if (searchDescriptions) {
        newResults = newResults.sort((a, b) => b.priority - a.priority);
      }

      if (searchProvider) {
        newResults.push({
          href: searchProvider.url + encodeURIComponent(searchString),
          name: `${searchProvider.name ?? t("quicklaunch.custom")} ${t("quicklaunch.search")} `,
          type: "search",
        });
      }

      if (!hideVisitURL && url) {
        newResults.unshift({
          href: url.toString(),
          name: `${t("quicklaunch.visit")} URL`,
          type: "url",
        });
      }

      setResults(newResults);

      if (newResults.length) {
        setCurrentItemIndex(0);
      }
    }
  }, [searchString, servicesAndBookmarks, searchDescriptions, hideVisitURL, searchProvider, url, t]);

  const [hidden, setHidden] = useState(true);
  useEffect(() => {
    function handleBackdropClick(event) {
      if (event.target?.tagName === "DIV") closeAndReset();
    }

    if (isOpen) {
      searchField.current.focus();
      document.body.addEventListener("click", handleBackdropClick);
      setHidden(false);
    } else {
      document.body.removeEventListener("click", handleBackdropClick);
      searchField.current.blur();
      setTimeout(() => {
        setHidden(true);
      }, 300); // disable on close
    }
  }, [isOpen, closeAndReset]);

  function highlightText(text) {
    const parts = text.split(new RegExp(`(${searchString})`, "gi"));
    return (
      <span>
        {parts.map((part, i) =>
          part.toLowerCase() === searchString.toLowerCase() ? (
            // eslint-disable-next-line react/no-array-index-key
            <span key={`${searchString}_${i}`} className="bg-theme-300/10">
              {part}
            </span>
          ) : (
            part
          ),
        )}
      </span>
    );
  }

  return (
    <div
      className={classNames(
        "relative z-40 ease-in-out duration-300 transition-opacity",
        hidden && !isOpen && "hidden",
        !hidden && isOpen && "opacity-100",
        !isOpen && "opacity-0",
      )}
      role="dialog"
      aria-modal="true"
    >
      <div className="fixed inset-0 bg-gray-500 bg-opacity-50" />
      <div className="fixed inset-0 z-20 overflow-y-auto">
        <div className="flex min-h-full min-w-full items-start justify-center text-center">
          <dialog className="mt-[10%] min-w-[80%] max-w-[90%] md:min-w-[40%] rounded-md p-0 block font-medium text-theme-700 dark:text-theme-200 dark:hover:text-theme-300 shadow-md shadow-theme-900/10 dark:shadow-theme-900/20 bg-theme-50 dark:bg-theme-800">
            <input
              placeholder="Search"
              className={classNames(
                results.length > 0 && "rounded-t-md",
                results.length === 0 && "rounded-md",
                "w-full p-4 m-0 border-0 border-b border-slate-700 focus:border-slate-700 focus:outline-0 focus:ring-0 text-sm md:text-xl text-theme-700 dark:text-theme-200 bg-theme-60 dark:bg-theme-800",
              )}
              type="text"
              autoCorrect="false"
              ref={searchField}
              value={searchString}
              onChange={handleSearchChange}
              onKeyDown={handleSearchKeyDown}
            />
            {results.length > 0 && (
              <ul className="max-h-[60vh] overflow-y-auto m-2">
                {results.map((r, i) => (
                  <li key={[r.name, r.container, r.app, r.href].filter((s) => s).join("-")}>
                    <button
                      type="button"
                      data-index={i}
                      onMouseEnter={handleItemHover}
                      onClick={handleItemClick}
                      onKeyDown={handleItemKeyDown}
                      className={classNames(
                        "flex flex-row w-full items-center justify-between rounded-md text-sm md:text-xl py-2 px-4 cursor-pointer text-theme-700 dark:text-theme-200",
                        i === currentItemIndex && "bg-theme-300/50 dark:bg-theme-700/50",
                      )}
                    >
                      <div className="flex flex-row items-center mr-4 pointer-events-none">
                        {(r.icon || r.abbr) && (
                          <div className="w-5 text-xs mr-4">
                            {r.icon && <ResolvedIcon icon={r.icon} />}
                            {r.abbr && r.abbr}
                          </div>
                        )}
                        <div className="flex flex-col md:flex-row text-left items-baseline mr-4 pointer-events-none">
                          <span className="mr-4">{r.name}</span>
                          {r.description && (
                            <span className="text-xs text-theme-600 text-light">
                              {searchDescriptions && r.priority < 2 ? highlightText(r.description) : r.description}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-xs text-theme-600 font-bold pointer-events-none">
                        {t(`quicklaunch.${r.type ? r.type.toLowerCase() : "bookmark"}`)}
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </dialog>
        </div>
      </div>
    </div>
  );
}
