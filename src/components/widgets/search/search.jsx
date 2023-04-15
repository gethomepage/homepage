import { useState, useEffect, Fragment } from "react";
import { useTranslation } from "next-i18next";
import { FiSearch } from "react-icons/fi";
import { SiDuckduckgo, SiMicrosoftbing, SiGoogle, SiBaidu, SiBrave } from "react-icons/si";
import { Listbox, Transition } from "@headlessui/react";
import classNames from "classnames";

export const searchProviders = {
  google: {
    name: "Google",
    url: "https://www.google.com/search?q=",
    icon: SiGoogle,
  },
  duckduckgo: {
    name: "DuckDuckGo",
    url: "https://duckduckgo.com/?q=",
    icon: SiDuckduckgo,
  },
  bing: {
    name: "Bing",
    url: "https://www.bing.com/search?q=",
    icon: SiMicrosoftbing,
  },
  baidu: {
    name: "Baidu",
    url: "https://www.baidu.com/s?wd=",
    icon: SiBaidu,
  },
  brave: {
    name: "Brave",
    url: "https://search.brave.com/search?q=",
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
  if (typeof window !== 'undefined') {
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
  const [selectedProvider, setSelectedProvider] = useState(searchProviders[availableProviderIds[0] ?? searchProviders.google]);

  useEffect(() => {
    const storedProvider = getStoredProvider();
    let storedProviderKey = null;
    storedProviderKey = Object.keys(searchProviders).find((pkey) => searchProviders[pkey] === storedProvider);
    if (storedProvider && availableProviderIds.includes(storedProviderKey)) {
      setSelectedProvider(storedProvider);
    }
  }, [availableProviderIds]);

  if (!availableProviderIds) {
    return null;
  }

  function handleSubmit(event) {
    const q = encodeURIComponent(query);

    const { url } = selectedProvider;
    if (url) {
      window.open(`${url}${q}`, options.target || "_blank");
    } else {
      window.open(`${options.url}${q}`, options.target || "_blank");
    }

    event.preventDefault();
    event.target.reset();
    setQuery("");
  }

  const onChangeProvider = (provider) => {
    setSelectedProvider(provider);
    localStorage.setItem(localStorageKey, provider.name);
  }

  return (
    <form className={classNames(
      "flex-col relative h-8 my-4 min-w-fit grow first:ml-0 ml-4",
      options?.styleBoxed === true && " h-14 ml-4 mt-4 m:mb-0 rounded-md shadow-md shadow-theme-900/10 dark:shadow-theme-900/20 bg-theme-100/20 dark:bg-white/5 p-3",
    )} onSubmit={handleSubmit}>
      <div className="flex absolute inset-y-0 left-0 items-center pl-3 pointer-events-none w-full text-theme-800 dark:text-white" />
      <input
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
        onChange={(s) => setQuery(s.currentTarget.value)}
        required
        autoCapitalize="off"
        autoCorrect="off"
        autoComplete="off"
        // eslint-disable-next-line jsx-a11y/no-autofocus
        autoFocus={options.focus}
      />
      <Listbox as="div" value={selectedProvider} onChange={onChangeProvider} className="relative text-left" disabled={availableProviderIds?.length === 1}>
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
                          active ? "bg-theme-600/10 dark:bg-white/10 dark:text-gray-900" : "dark:text-gray-100"
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
    </form>
  );
}
