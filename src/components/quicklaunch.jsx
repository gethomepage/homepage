import classNames from "classnames";
import { useTranslation } from "next-i18next/pages";
import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { FiSearch } from "react-icons/fi";
import useSWR from "swr";
import { SettingsContext } from "utils/contexts/settings";

import ResolvedIcon from "./resolvedicon";
import { getStoredProvider, searchProviders } from "./widgets/search/search";

const MOBILE_BUTTON_POSITIONS = {
  "top-left": "top-4 left-4",
  "top-right": "top-4 right-4",
  "bottom-left": "bottom-4 left-4",
  "bottom-right": "bottom-4 right-4",
};

function parseUrl(searchString) {
  if (!/.+[.:].+/.test(searchString)) return null; // basic test for probably a url

  try {
    return new URL(searchString.toLowerCase().startsWith("http") ? searchString : `https://${searchString}`);
  } catch {
    return null;
  }
}

function getSearchResults({
  hideVisitURL,
  searchDescriptions,
  searchProvider,
  searchString,
  searchSuggestions,
  servicesAndBookmarks,
  t,
  url,
}) {
  if (searchString.trim().length === 0) return [];

  const results = servicesAndBookmarks.flatMap((result) => {
    const nameMatch = result.name.toLowerCase().includes(searchString);
    const descriptionMatch = searchDescriptions && result.description?.toLowerCase().includes(searchString);

    if (!nameMatch && !descriptionMatch) return [];
    return [{ ...result, ...(searchDescriptions && { priority: nameMatch ? 2 : +descriptionMatch }) }];
  });

  if (searchDescriptions) {
    results.sort((a, b) => b.priority - a.priority);
  }

  if (searchProvider) {
    results.push({
      href: searchProvider.url + encodeURIComponent(searchString),
      name: `${searchProvider.name ?? t("quicklaunch.custom")} ${t("quicklaunch.search")}`,
      type: "search",
    });

    if (searchProvider.showSearchSuggestions && searchProvider.suggestionUrl && searchSuggestions[1]) {
      results.push(
        ...searchSuggestions[1].map((suggestion) => ({
          href: searchProvider.url + encodeURIComponent(suggestion),
          name: suggestion,
          type: "searchSuggestion",
        })),
      );
    }
  }

  if (!hideVisitURL && url) {
    results.unshift({
      href: url.toString(),
      name: `${t("quicklaunch.visit")} URL`,
      type: "url",
    });
  }

  return results;
}

export default function QuickLaunch({ servicesAndBookmarks, searchString, setSearchString, isOpen, setSearching }) {
  const { t } = useTranslation();

  const { settings } = useContext(SettingsContext);
  const { searchDescriptions = false, hideVisitURL = false } = settings?.quicklaunch ?? {};

  const searchField = useRef();

  const [currentItemIndex, setCurrentItemIndex] = useState(null);
  const url = parseUrl(searchString);
  const [searchSuggestions, setSearchSuggestions] = useState([]);

  const { data: widgets } = useSWR("/api/widgets");
  const searchWidget = Object.values(widgets).find((w) => w.type === "search");

  let searchProvider;

  if (settings?.quicklaunch?.provider === "custom" && settings?.quicklaunch?.url?.length > 0) {
    searchProvider = settings.quicklaunch;
  } else if (settings?.quicklaunch?.provider && settings?.quicklaunch?.provider !== "custom") {
    searchProvider = searchProviders[settings.quicklaunch.provider];
  } else if (searchWidget) {
    // If there is no search provider in quick launch settings, try to get it from the search widget
    if (Array.isArray(searchWidget.options?.provider)) {
      // If search provider is a list, try to retrieve from localstorage, fall back to the first
      searchProvider = getStoredProvider() ?? searchProviders[searchWidget.options.provider[0]];
    } else if (searchWidget.options?.provider === "custom") {
      searchProvider = searchWidget.options;
    } else {
      searchProvider = searchProviders[searchWidget.options?.provider];
    }
  }

  if (searchProvider) {
    searchProvider.showSearchSuggestions = !!(
      settings?.quicklaunch?.showSearchSuggestions ??
      searchWidget?.options?.showSearchSuggestions ??
      false
    );
  }

  let mobileButtonPosition = settings.quicklaunch?.mobileButtonPosition
    ? MOBILE_BUTTON_POSITIONS[settings.quicklaunch.mobileButtonPosition]
    : null;

  function openCurrentItem(newWindow) {
    const result = results[activeItemIndex];
    window.open(
      result.href,
      newWindow ? "_blank" : (result.target ?? searchProvider?.target ?? settings.target ?? "_blank"),
      "noreferrer",
    );
  }

  const closeAndReset = useCallback(() => {
    setSearching(false);
    setTimeout(() => {
      setSearchString("");
      setCurrentItemIndex(null);
      setSearchSuggestions([]);
    }, 200); // delay a little for animations
  }, [setSearching, setSearchString, setCurrentItemIndex, setSearchSuggestions]);

  function handleSearchChange(event) {
    const rawSearchString = event.target.value;
    setCurrentItemIndex(null);
    // urls keep their casing, everything else is lowercased for matching
    setSearchString(parseUrl(rawSearchString) ? rawSearchString : rawSearchString.toLowerCase());
  }

  function handleSearchKeyDown(event) {
    if (!isOpen) return;

    if (event.key === "Escape") {
      closeAndReset();
      event.preventDefault();
    } else if (event.key === "Enter" && results.length) {
      closeAndReset();
      openCurrentItem(event.metaKey);
    } else if (event.key === "ArrowDown" && results[activeItemIndex + 1]) {
      setCurrentItemIndex(activeItemIndex + 1);
      event.preventDefault();
    } else if (event.key === "ArrowUp" && activeItemIndex > 0) {
      setCurrentItemIndex(activeItemIndex - 1);
      event.preventDefault();
    } else if (
      event.key === "ArrowRight" &&
      results[activeItemIndex] &&
      results[activeItemIndex].type === "searchSuggestion"
    ) {
      setCurrentItemIndex(null);
      setSearchString(results[activeItemIndex].name);
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
    if (
      searchString.trim().length === 0 ||
      !searchProvider?.showSearchSuggestions ||
      !searchProvider.suggestionUrl ||
      searchString.trim() === searchSuggestions[0]?.trim()
    ) {
      return undefined;
    }

    const abortController = new AbortController();

    fetch(
      `/api/search/searchSuggestion?query=${encodeURIComponent(searchString)}&providerName=${
        searchProvider.name ?? "Custom"
      }`,
      { signal: abortController.signal },
    )
      .then(async (searchSuggestionResult) => {
        const newSearchSuggestions = await searchSuggestionResult.json();

        if (newSearchSuggestions) {
          setCurrentItemIndex(null);
          setSearchSuggestions([newSearchSuggestions[0], newSearchSuggestions[1].slice(0, 4)]);
        }
      })
      .catch(() => {
        // If there is an error, just ignore it. There just will be no search suggestions.
      });

    return () => abortController.abort();
  }, [searchProvider, searchString, searchSuggestions]);

  const results = getSearchResults({
    hideVisitURL,
    searchDescriptions,
    searchProvider,
    searchString,
    searchSuggestions,
    servicesAndBookmarks,
    t,
    url,
  });

  const activeItemIndex = currentItemIndex ?? (results.length ? 0 : null);

  useEffect(() => {
    function handleBackdropClick(event) {
      if (event.target?.tagName === "DIV") closeAndReset();
    }

    if (isOpen) {
      searchField.current.focus();
      document.body.addEventListener("click", handleBackdropClick);
    } else {
      searchField.current.blur();
    }

    return () => document.body.removeEventListener("click", handleBackdropClick);
  }, [isOpen, closeAndReset]);

  function highlightText(text) {
    const parts = text.split(new RegExp(`(${searchString})`, "gi"));
    return (
      <span>
        {parts.map((part, i) =>
          part.toLowerCase() === searchString.toLowerCase() ? (
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
    <>
      <div
        className={classNames(
          "relative z-40 ease-in-out",
          isOpen ? "visible opacity-100" : "invisible opacity-0 pointer-events-none",
        )}
        style={{
          transitionProperty: "opacity, visibility",
          transitionDuration: "300ms, 0s",
          transitionDelay: isOpen ? "0s, 0s" : "0s, 300ms",
        }}
        role="dialog"
        aria-modal="true"
        aria-hidden={!isOpen}
      >
        <div className="fixed inset-0 bg-gray-500 opacity-50" />
        <div className="fixed inset-0 z-20 overflow-y-auto">
          <div className="flex min-h-full min-w-full items-start justify-center text-center">
            <dialog className="mt-[10%] mx-auto min-w-[90%] max-w-[90%] md:min-w-[40%] md:max-w-[40%] rounded-md p-0 block font-medium text-theme-700 dark:text-theme-200 dark:hover:text-theme-300 shadow-md shadow-theme-900/10 dark:shadow-theme-900/20 bg-theme-50 dark:bg-theme-800">
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
                          i === activeItemIndex && "bg-theme-300/50 dark:bg-theme-700/50",
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
                            {r.type !== "searchSuggestion" && <span className="mr-4">{r.name}</span>}
                            {r.type === "searchSuggestion" && (
                              <div className="flex-nowrap">
                                <span className="whitespace-pre">
                                  {r.name.indexOf(searchString) === 0 ? searchString : ""}
                                </span>
                                <span className="whitespace-pre opacity-50">
                                  {r.name.indexOf(searchString) === 0 ? r.name.substring(searchString.length) : r.name}
                                </span>
                              </div>
                            )}
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
      {mobileButtonPosition && (
        <button
          type="button"
          onClick={setSearching.bind(this, !isOpen)}
          className={`fixed ${mobileButtonPosition} z-40 p-2 rounded-full sm:hidden text-theme-700 dark:text-theme-200 bg-theme-50 dark:bg-theme-800 shadow-md shadow-theme-900/10 dark:shadow-theme-900/20 transition-opacity duration-100`}
          style={{ opacity: isOpen ? 0 : 1 }}
        >
          <FiSearch className="w-4 h-4" />
        </button>
      )}
    </>
  );
}
