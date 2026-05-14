import { useState, useCallback } from "react";
import classNames from "classnames";

export default function SearchBar({ services, onServiceSelect }) {
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);

  const filtered = query.length > 0
    ? services.filter((s) =>
        s.name.toLowerCase().includes(query.toLowerCase()) ||
        s.description?.toLowerCase().includes(query.toLowerCase())
      )
    : [];

  const handleSelect = useCallback((service) => {
    onServiceSelect(service);
    setQuery("");
    setFocused(false);
  }, [onServiceSelect, query]);

  return (
    <div className={classNames(
      "relative flex items-center transition-all duration-200",
      focused ? "w-72" : "w-48"
    )}>
      <div className="absolute left-2 pointer-events-none text-theme-400">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setTimeout(() => setFocused(false), 150)}
        placeholder="Search services..."
        className="w-full pl-8 pr-3 py-1.5 text-sm bg-theme-100 dark:bg-theme-800 border border-theme-300 dark:border-theme-600 rounded-md text-theme-700 dark:text-theme-200 placeholder-theme-400 focus:outline-none focus:ring-1 focus:ring-theme-500 dark:focus:ring-theme-400 transition-all"
      />
      {query.length > 0 && filtered.length > 0 && (
        <ul className="absolute top-full left-0 right-0 z-50 mt-1 bg-theme-100 dark:bg-theme-800 border border-theme-300 dark:border-theme-600 rounded-md shadow-lg max-h-64 overflow-y-auto">
          {filtered.map((service) => (
            <li key={service.name}>
              <button
                type="button"
                onClick={() => handleSelect(service)}
                className="w-full px-3 py-2 text-left text-sm hover:bg-theme-200 dark:hover:bg-theme-700 flex items-center gap-2 transition-colors"
              >
                {service.icon && (
                  <img src={service.icon} alt="" className="w-5 h-5 rounded-sm" />
                )}
                <div>
                  <div className="text-theme-700 dark:text-theme-200">{service.name}</div>
                  {service.description && (
                    <div className="text-xs text-theme-400 truncate">{service.description}</div>
                  )}
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}
      {query.length > 0 && filtered.length === 0 && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-theme-100 dark:bg-theme-800 border border-theme-300 dark:border-theme-600 rounded-md shadow-lg px-3 py-2 text-sm text-theme-400">
          No services found
        </div>
      )}
    </div>
  );
}