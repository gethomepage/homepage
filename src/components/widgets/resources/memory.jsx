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
          <span className="text-theme-800 dark:text-theme-200 text-xs">Resources</span>
          <span className="text-theme-800 dark:text-theme-200 text-xs">Error</span>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex-none flex flex-row items-center justify-center">
        <FaMemory className="text-theme-800 dark:text-theme-200 w-5 h-5" />
        <div className="flex flex-col ml-3 text-left font-mono">
          <span className="text-theme-800 dark:text-theme-200 text-xs">- GB Used</span>
          <span className="text-theme-800 dark:text-theme-200 text-xs">- GB Free</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-none flex flex-row items-center justify-center">
      <FaMemory className="text-theme-800 dark:text-theme-200 w-5 h-5" />
      <div className="flex flex-col ml-3 text-left font-mono">
        <span className="text-theme-800 dark:text-theme-200 text-xs">
          {formatBytes(data.memory.usedMemMb * 1024 * 1024)} Used
        </span>
        <span className="text-theme-800 dark:text-theme-200 text-xs">
          {formatBytes(data.memory.freeMemMb * 1024 * 1024)} Free
        </span>
      </div>
    </div>
  );
}
