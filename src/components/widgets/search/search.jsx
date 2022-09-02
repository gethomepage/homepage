import { useState } from "react";
import { FiSearch } from "react-icons/fi";
import { FcGoogle } from "react-icons/fc";
import { SiDuckduckgo } from "react-icons/si";
import { SiMicrosoftbing } from "react-icons/si";

export default function Search({ options, classN }) {
  const providers = ["google", "bing", "duckduckgo", "custom"];
  const targets = ["_blank", "_parent", "_top"];

  const [query, setQuery] = useState("");

  function search() {
    if (!providers.includes(options.provider)) {
      return;
    } else {
      if (options.provider === "custom") {
        if (targets.includes(options.target)) {
          window.open(options.customdata.url + query, options.target);
        } else window.open(options.customdata.url + query, "_self");
      } else {
        if (targets.includes(options.target)) {
          window.open(`https://www.${options.provider}.com/search?q=` + query, `${options.target}`);
        } else window.open(`https://www.${options.provider}.com/search?q=` + query, "_self");
      }
    }

    setQuery("");
  }

  if (!options || (options.provider === "custom" && !options.customdata)) {
    return <></>;
  }

  return (
    <form className={`grow flex-col relative h-8 my-4 md:my-0 min-w-full md:min-w-fit ${classN}`}>
      <div className="flex absolute inset-y-0 left-0 items-center pl-3 pointer-events-none w-full text-theme-800 dark:text-theme-200">
        {options.provider == "google" ? (
          <FcGoogle className="text-theme-800 dark:text-theme-200 w-3 h-3" />
        ) : options.provider == "duckduckgo" ? (
          <SiDuckduckgo className="text-theme-800 dark:text-theme-200 w-3 h-3" />
        ) : options.provider == "bing" ? (
          <SiMicrosoftbing className="text-theme-800 dark:text-theme-200 w-3 h-3" />
        ) : options.provider == "custom" ? (
          options.customdata.abbr.length > 2 ? (
            options.customdata.abbr.substring(0, 2)
          ) : (
            options.customdata.abbr
          )
        ) : (
          ""
        )}
      </div>
      <input
        type="search"
        autoFocus
        className={`block ${
          options.customdata && options.customdata.abbr && options.customdata.abbr.length > 1 ? "pl-12" : "pl-10"
        } w-full text-sm text-gray-900 bg-gray-50 rounded-full border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 h-full`}
        placeholder="Search..."
        onChange={(s) => setQuery(s.currentTarget.value)}
        required
      />
      <button
        type="submit"
        onClick={search}
        className="text-white absolute right-0.5 bottom-0.5 bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-r-full text-sm px-4 py-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
      >
        <FiSearch className="text-theme-200 dark:text-theme-200 w-3 h-3" />
      </button>
    </form>
  );
}
