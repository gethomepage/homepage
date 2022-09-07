import useSWR from "swr";
import { FaMemory } from "react-icons/fa";
import { BiError } from "react-icons/bi";

import { formatBytes } from "utils/stats-helpers";

export default function Memory() {
  const { data, error } = useSWR(`/api/widgets/resources?type=memory`, {
    refreshInterval: 1500,
  });

  if (error || data?.error) {
    return (
      <div className="flex-none flex flex-row items-center justify-center">
        <BiError className="text-theme-800 dark:text-theme-200 w-5 h-5" />
        <div className="flex flex-col ml-3 text-left font-mono">
          <span className="text-theme-800 dark:text-theme-200 text-xs">API Error</span>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex-none flex flex-row items-center justify-center">
        <FaMemory className="text-theme-800 dark:text-theme-200 w-5 h-5" />
        <div className="flex flex-col ml-3 text-left font-mono">
          <span className="text-theme-800 dark:text-theme-200 text-xs">-</span>
        </div>
      </div>
    );
  }

  const percent = Math.round((data.memory.usedMemMb / data.memory.totalMemMb) * 100);

  return (
    <div className="flex-none flex flex-row items-center justify-center group">
      <FaMemory className="text-theme-800 dark:text-theme-200 w-5 h-5" />
      <div className="flex flex-col ml-3 text-left font-mono">
        <span className="text-theme-800 dark:text-theme-200 text-xs group-hover:hidden">
          {formatBytes(data.memory.freeMemMb * 1024 * 1024)} Free
        </span>
        <span className="text-theme-800 dark:text-theme-200 text-xs hidden group-hover:block">
          {formatBytes(data.memory.usedMemMb * 1024 * 1024)} Used
        </span>
        <div className="w-full bg-gray-200 rounded-full h-1 dark:bg-gray-700">
          <div
            className="bg-theme-600 h-1 rounded-full dark:bg-theme-500"
            style={{
              width: `${percent}%`,
            }}
          />
        </div>
      </div>
    </div>
  );
}
