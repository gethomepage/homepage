import useSWR from "swr";
import { FiHardDrive } from "react-icons/fi";
import { BiError } from "react-icons/bi";
import { formatBytes } from "utils/stats-helpers";

export default function Disk({ options }) {
  const { data, error } = useSWR(`/api/widgets/resources?type=disk&target=${options.disk}`, {
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
        <FiHardDrive className="text-theme-800 dark:text-theme-200 w-5 h-5" />
        <div className="flex flex-col ml-3 text-left font-mono">
          <span className="text-theme-800 dark:text-theme-200 text-xs">- Free</span>
          <span className="text-theme-800 dark:text-theme-200 text-xs">- Used</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-none flex flex-row items-center justify-center">
      <FiHardDrive className="text-theme-800 dark:text-theme-200 w-5 h-5" />
      <div className="flex flex-col ml-3 text-left font-mono">
        <span className="text-theme-800 dark:text-theme-200 text-xs">
          {formatBytes(data.drive.freeGb * 1024 * 1024 * 1024)} Free
        </span>
        <span className="text-theme-800 dark:text-theme-200 text-xs">
          {formatBytes(data.drive.usedGb * 1024 * 1024 * 1024)} Used
        </span>
      </div>
    </div>
  );
}
