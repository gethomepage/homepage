import { useTranslation } from "react-i18next";
import { useEffect, useState, useRef } from "react";
import classNames from "classnames";

export default function Search({bookmarks, services, searchString, setSearchString, isOpen, close}) {
  const { t, i18n } = useTranslation();
  const all = [...bookmarks.map(bg => bg.bookmarks).flat(), ...services.map(sg => sg.services).flat()];

  const searchField = useRef();

  const [results, setResults] = useState([]);
  const [currentItemIndex, setCurrentItemIndex] = useState(null);

  function handleSearchChange(event) {
    setSearchString(event.target.value.toLowerCase())
  }

  function handleSearchKeyDown(event) {
    if (event.key === "Escape") {
      setSearchString("");
      close(false);
    } else if (event.key === "Enter" && results.length) {
      setSearchString("");
      close(false);
      const result = results[currentItemIndex];
      console.log("go to", result);
      window.open(result.href, '_blank');
    } else if (event.key == "ArrowDown" && results[currentItemIndex + 1]) {
      setCurrentItemIndex(currentItemIndex + 1);
      event.preventDefault();
    } else if (event.key == "ArrowUp" && currentItemIndex > 0) {
      setCurrentItemIndex(currentItemIndex - 1);
      event.preventDefault();
    }
  }

  useEffect(() => {
    if (searchString.length === 0) setResults([]);
    else {
      const newResults = all.filter(r => r.name.toLowerCase().includes(searchString));
      setResults(newResults);
      if (newResults.length) {
        setCurrentItemIndex(0);
      }
    }
  }, [searchString])


  const [hidden, setHidden] = useState(true);
  useEffect(() => {
    if (isOpen) {
      searchField.current.focus();
      setHidden(false);
    } else {
      setTimeout(() => {
        setHidden(true);
      }, 300); // disable on close
    }
  }, [isOpen])

  return (
    <div className={classNames(
      "relative z-10 ease-in-out duration-300 transition-opacity",
      hidden && !isOpen && "hidden",
      !hidden && isOpen && "opacity-100",
      !isOpen && "opacity-0",
    )} role="dialog" aria-modal="true">
      <div className="fixed inset-0 bg-gray-500 bg-opacity-50"></div>
      <div className="fixed inset-0 z-10 overflow-y-auto">
        <div className="flex min-h-full min-w-full items-start justify-center text-center">
            <div className="mt-[10%] p-4 min-w-[50%] rounded-md font-medium text-theme-700 dark:text-theme-200 dark:hover:text-theme-300 shadow-md shadow-theme-900/10 dark:shadow-theme-900/20 bg-theme-50 dark:bg-theme-800">
              <div className="text-center">
                <input placeholder="Search" className="rounded-md text-xl min-w-full text-theme-700 dark:text-theme-200 bg-theme-60 dark:bg-theme-800" type="text" ref={searchField} value={searchString} onChange={handleSearchChange} onKeyDown={handleSearchKeyDown} />
                <ul>
                  {results.map((w, i) => {
                    return (
                      <li className={classNames(
                        i === currentItemIndex && "bg-theme-60/50 dark:bg-theme-700/50",
                        i !== currentItemIndex && "bg-theme-50/50 dark:bg-theme-800/50",
                        "text-xl py-3 cursor-pointer text-theme-700 dark:text-theme-200 dark:hover:text-theme-300 hover:bg-theme-900/50 dark:hover:bg-theme-900/50",
                        )} key={w.name}>
                          {w.name}
                      </li>)
                  })
                  }
                </ul>
                </div>
              </div>
          </div>
        </div>
      </div>
  );
}
