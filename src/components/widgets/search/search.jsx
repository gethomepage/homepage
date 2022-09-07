import { useState } from "react";
import { FiSearch } from "react-icons/fi";
import { SiDuckduckgo, SiMicrosoftbing, SiGoogle } from "react-icons/si";

const providers = {
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
  custom: {
    name: "Custom",
    url: false,
    icon: FiSearch,
  },
};

export default function Search({ options }) {
  const provider = providers[options.provider];
  const [query, setQuery] = useState("");

  if (!provider) {
    return null;
  }

  function handleSubmit(event) {
    const q = encodeURIComponent(query);

    if (provider.url) {
      window.open(`${provider.url}${q}`, options.target || "_blank");
    } else {
      window.open(`${options.url}${q}`, options.target || "_blank");
    }

    event.preventDefault();
    event.target.reset();
    setQuery("");
  }

  return (
    <form className="flex-col relative h-8 my-4 min-w-full md:min-w-fit grow" onSubmit={handleSubmit}>
      <div className="flex absolute inset-y-0 left-0 items-center pl-3 pointer-events-none w-full text-theme-800 dark:text-theme-200" />
      <input
        type="search"
        className="overflow-hidden w-full placeholder-theme-900 text-xs text-theme-900 bg-theme-50 rounded-md border border-theme-300 focus:ring-theme-500 focus:border-theme-500 dark:bg-theme-800 dark:border-theme-600 dark:placeholder-theme-400 dark:text-white dark:focus:ring-theme-500 dark:focus:border-theme-500 h-full"
        placeholder="Search..."
        onChange={(s) => setQuery(s.currentTarget.value)}
        required
      />
      <button
        type="submit"
        className="text-white absolute right-0.5 bottom-0.5 bg-theme-700 hover:bg-theme-800 border-1 focus:ring-2 focus:ring-theme-300 font-medium rounded-r-md text-sm px-4 py-2 dark:bg-theme-600 dark:hover:bg-theme-700 dark:focus:ring-theme-500"
      >
        <provider.icon className="text-theme-800 dark:text-theme-200 w-3 h-3" />
      </button>
    </form>
  );
}
