import useSWR from "swr";
import { FiHardDrive, FiCpu } from "react-icons/fi";
import { FaMemory } from "react-icons/fa";
import { BiError } from "react-icons/bi";

export default function Resources({ options }) {
  const { data, error } = useSWR(`/api/widgets/resources?disk=${options.disk}`, {
    refreshInterval: 1500,
  });

  if (error) {
    return (
      <div className="flex-none flex flex-row items-center justify-center mr-5">
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
      <>
        {options.disk && (
          <div className="flex-none flex flex-row items-center justify-center mr-5">
            <FiHardDrive className="text-theme-800 dark:text-theme-200 w-5 h-5" />
            <div className="flex flex-col ml-3 text-left font-mono">
              <span className="text-theme-800 dark:text-theme-200 text-xs">- GB free</span>
              <span className="text-theme-800 dark:text-theme-200 text-xs">- GB used</span>
            </div>
          </div>
        )}

        {options.cpu && (
          <div className="flex-none flex flex-row items-center justify-center mr-5">
            <FiCpu className="text-theme-800 dark:text-theme-200 w-5 h-5" />
            <div className="flex flex-col ml-3 text-left font-mono">
              <span className="text-theme-800 dark:text-theme-200 text-xs">- Usage</span>
              <span className="text-theme-800 dark:text-theme-200 text-xs">- Load</span>
            </div>
          </div>
        )}

        {options.memory && (
          <div className="flex-none flex flex-row items-center justify-center mr-5">
            <FaMemory className="text-theme-800 dark:text-theme-200 w-5 h-5" />
            <div className="flex flex-col ml-3 text-left font-mono">
              <span className="text-theme-800 dark:text-theme-200 text-xs">- GB Used</span>
              <span className="text-theme-800 dark:text-theme-200 text-xs">- GB Free</span>
            </div>
          </div>
        )}
      </>
    );
  }

  if (data.error) {
    return <div className="flex flex-col items-center justify-center"></div>;
  }

  return (
    <>
      {options.disk && (
        <div className="flex-none flex flex-row items-center justify-center mr-5">
          <FiHardDrive className="text-theme-800 dark:text-theme-200 w-5 h-5" />
          <div className="flex flex-col ml-3 text-left font-mono">
            <span className="text-theme-800 dark:text-theme-200 text-xs">{Math.round(data.drive.freeGb)} GB free</span>
            <span className="text-theme-800 dark:text-theme-200 text-xs">{Math.round(data.drive.usedGb)} GB used</span>
          </div>
        </div>
      )}

      {options.cpu && (
        <div className="flex-none flex flex-row items-center justify-center mr-5">
          <FiCpu className="text-theme-800 dark:text-theme-200 w-5 h-5" />
          <div className="flex flex-col ml-3 text-left font-mono">
            <span className="text-theme-800 dark:text-theme-200 text-xs">{Math.round(data.cpu.usage)}% Usage</span>
            <span className="text-theme-800 dark:text-theme-200 text-xs">
              {Math.round(data.cpu.load * 100) / 100} Load
            </span>
          </div>
        </div>
      )}

      {options.memory && (
        <div className="flex-none flex flex-row items-center justify-center mr-5">
          <FaMemory className="text-theme-800 dark:text-theme-200 w-5 h-5" />
          <div className="flex flex-col ml-3 text-left font-mono">
            <span className="text-theme-800 dark:text-theme-200 text-xs">
              {Math.round((data.memory.usedMemMb / 1024) * 100) / 100} GB Used
            </span>
            <span className="text-theme-800 dark:text-theme-200 text-xs">
              {Math.round((data.memory.freeMemMb / 1024) * 100) / 100} GB Free
            </span>
          </div>
        </div>
      )}
    </>
  );
}
