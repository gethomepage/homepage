import { useState, useEffect, Fragment } from "react";
import { useTranslation } from "next-i18next";
import { FiSearch } from "react-icons/fi";
import { SiDuckduckgo, SiGoogle, SiBaidu, SiBrave } from "react-icons/si";
import { BiLogoBing } from "react-icons/bi";
import { Listbox, Transition, Combobox } from "@headlessui/react";
import classNames from "classnames";

import ContainerForm from "../widget/container_form";
import Raw from "../widget/raw";

export const searchProviders = {
  google: {
    name: "Google",
    url: "https://www.google.com/search?q=",
    suggestionUrl: "https://www.google.com/complete/search?client=chrome&q=",
    icon: SiGoogle,
  },
  duckduckgo: {
    name: "DuckDuckGo",
    url: "https://duckduckgo.com/?q=",
    suggestionUrl: "https://duckduckgo.com/ac/?type=list&q=",
    icon: SiDuckduckgo,
  },
  bing: {
    name: "Bing",
    url: "https://www.bing.com/search?q=",
    suggestionUrl: "https://api.bing.com/osjson.aspx?query=",
    icon: BiLogoBing,
  },
  baidu: {
    name: "Baidu",
    url: "https://www.baidu.com/s?wd=",
    suggestionUrl: "http://suggestion.baidu.com/su?&action=opensearch&ie=utf-8&wd=",
    icon: SiBaidu,
  },
  brave: {
    name: "Brave",
    url: "https://search.brave.com/search?q=",
    suggestionUrl: "https://search.brave.com/api/suggest?&rich=false&q=",
    icon: SiBrave,
  },
  custom: {
    name: "Custom",
    url: false,
    icon: FiSearch,
  },
};

function getAvailableProviderIds(options) {
  if (options.provider && Array.isArray(options.provider)) {
    return Object.keys(searchProviders).filter((value) => options.provider.includes(value));
  }
  if (options.provider && searchProviders[options.provider]) {
    return [options.provider];
  }
  return null;
}

const localStorageKey = "search-name";

export function getStoredProvider() {
  if (typeof window !== "undefined") {
    const storedName = localStorage.getItem(localStorageKey);
    if (storedName) {
      return Object.values(searchProviders).find((el) => el.name === storedName);
    }
  }
  return null;
}

export default function Search({ options }) {
  const { t } = useTranslation();

  const availableProviderIds = getAvailableProviderIds(options);

  const [query, setQuery] = useState("");
  const [selectedProvider, setSelectedProvider] = useState(
    searchProviders[availableProviderIds[0] ?? searchProviders.google],
  );
  const [searchSuggestions, setSearchSuggestions] = useState([]);

  useEffect(() => {
    const storedProvider = getStoredProvider();
    let storedProviderKey = null;
    storedProviderKey = Object.keys(searchProviders).find((pkey) => searchProviders[pkey] === storedProvider);
    if (storedProvider && availableProviderIds.includes(storedProviderKey)) {
      setSelectedProvider(storedProvider);
    }
  }, [availableProviderIds]);

  useEffect(() => {
    const abortController = new AbortController();

    if (
      options.showSearchSuggestions &&
      (selectedProvider.suggestionUrl || options.suggestionUrl) && // custom providers pass url via options
      query.trim().length > 0 &&
      query.trim() !== searchSuggestions[0]
    ) {
      fetch(`/api/search/searchSuggestion?query=${encodeURIComponent(query)}&providerName=${selectedProvider.name}`, {
        signal: abortController.signal,
      })
        .then(async (searchSuggestionResult) => {
          const newSearchSuggestions = await searchSuggestionResult.json();

          if (newSearchSuggestions) {
            if (newSearchSuggestions[1].length > 4) {
              newSearchSuggestions[1] = newSearchSuggestions[1].splice(0, 4);
            }
            setSearchSuggestions(newSearchSuggestions);
          }
        })
        .catch(() => {
          // If there is an error, just ignore it. There just will be no search suggestions.
        });
    }

    return () => {
      abortController.abort();
    };
  }, [selectedProvider, options, query, searchSuggestions]);

  let currentSuggestion;

  function doSearch(value) {
    const q = encodeURIComponent(value);
    const { url } = selectedProvider;
    if (url) {
      window.open(`${url}${q}`, options.target || "_blank");
    } else {
      window.open(`${options.url}${q}`, options.target || "_blank");
    }

    setQuery("");
    currentSuggestion = null;
  }

  const handleSearchKeyDown = (event) => {
    const useSuggestion = searchSuggestions.length && currentSuggestion;
    if (event.key === "Enter") {
      doSearch(useSuggestion ? currentSuggestion : event.target.value);
    }
  };

  if (!availableProviderIds) {
    return null;
  }

  const onChangeProvider = (provider) => {
    setSelectedProvider(provider);
    localStorage.setItem(localStorageKey, provider.name);
  };

  return (
    <ContainerForm options={options} additionalClassNames="grow information-widget-search">
      <Raw>
        <div className="flex-col relative h-8 my-4 min-w-fit z-20">
          <div className="flex absolute inset-y-0 left-0 items-center pl-3 pointer-events-none w-full text-theme-800 dark:text-white" />
          <Combobox value={query}>
            <Combobox.Input
              type="text"
              className="
              overflow-hidden w-full h-full rounded-md
              text-xs text-theme-900 dark:text-white
              placeholder-theme-900 dark:placeholder-white/80
              bg-white/50 dark:bg-white/10
              focus:ring-theme-500 dark:focus:ring-white/50
              focus:border-theme-500 dark:focus:border-white/50
              border border-theme-300 dark:border-theme-200/50"
              placeholder={t("search.placeholder")}
              onChange={(event) => {
                setQuery(event.target.value);
              }}
              required
              autoCapitalize="off"
              autoCorrect="off"
              autoComplete="off"
              // eslint-disable-next-line jsx-a11y/no-autofocus
              autoFocus={options.focus}
              onBlur={(e) => e.preventDefault()}
              onKeyDown={handleSearchKeyDown}
            />
            <Listbox
              as="div"
              value={selectedProvider}
              onChange={onChangeProvider}
              className="relative text-left"
              disabled={availableProviderIds?.length === 1}
            >
              <div>
                <Listbox.Button
                  className="
                  absolute right-0.5 bottom-0.5 rounded-r-md px-4 py-2 border-1
                  text-white font-medium text-sm
                  bg-theme-600/40 dark:bg-white/10
                  focus:ring-theme-500 dark:focus:ring-white/50"
                >
                  <selectedProvider.icon className="text-white w-3 h-3" />
                  <span className="sr-only">{t("search.search")}</span>
                </Listbox.Button>
              </div>
              <Transition
                as={Fragment}
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
              >
                <Listbox.Options
                  className="absolute right-0 z-10 mt-1 origin-top-right rounded-md
                  bg-theme-100 dark:bg-theme-600 shadow-lg
                  ring-1 ring-black ring-opacity-5 focus:outline-none"
                >
                  <div className="flex flex-col">
                    {availableProviderIds.map((providerId) => {
                      const p = searchProviders[providerId];
                      return (
                        <Listbox.Option key={providerId} value={p} as={Fragment}>
                          {({ active }) => (
                            <li
                              className={classNames(
                                "rounded-md cursor-pointer",
                                active ? "bg-theme-600/10 dark:bg-white/10 dark:text-gray-900" : "dark:text-gray-100",
                              )}
                            >
                              <p.icon className="h-4 w-4 mx-4 my-2" />
                            </li>
                          )}
                        </Listbox.Option>
                      );
                    })}
                  </div>
                </Listbox.Options>
              </Transition>
            </Listbox>

            {searchSuggestions[1]?.length > 0 && (
              <Combobox.Options className="mt-1 rounded-md bg-theme-50 dark:bg-theme-800 border border-theme-300 dark:border-theme-200/30 cursor-pointer shadow-lg">
                <div className="p-1 bg-white/50 dark:bg-white/10 text-theme-900/90 dark:text-white/90 text-xs">
                  <Combobox.Option key={query} value={query} />
                  {searchSuggestions[1].map((suggestion) => (
                    <Combobox.Option
                      key={suggestion}
                      value={suggestion}
                      onClick={() => {
                        doSearch(suggestion);
                      }}
                      className="flex w-full"
                    >
                      {({ active }) => {
                        if (active) currentSuggestion = suggestion;
                        return (
                          <div
                            className={classNames(
                              "px-2 py-1 rounded-md w-full flex-nowrap",
                              active ? "bg-theme-300/20 dark:bg-white/10" : "",
                            )}
                          >
                            <span className="whitespace-pre">{suggestion.indexOf(query) === 0 ? query : ""}</span>
                            <span className="mr-4 whitespace-pre opacity-50">
                              {suggestion.indexOf(query) === 0 ? suggestion.substring(query.length) : suggestion}
                            </span>
                          </div>
                        );
                      }}
                    </Combobox.Option>
                  ))}
                </div>
              </Combobox.Options>
            )}
          </Combobox>
        </div>
      </Raw>
    </ContainerForm>
  );
}
