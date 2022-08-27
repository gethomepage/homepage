import useSWR from "swr";
import { FiCpu } from "react-icons/fi";
import { BiError } from "react-icons/bi";

export default function Cpu() {
  const { data, error } = useSWR(`/api/widgets/resources?type=cpu`, {
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
        <FiCpu className="text-theme-800 dark:text-theme-200 w-5 h-5" />
        <div className="flex flex-col ml-3 text-left font-mono">
          <span className="text-theme-800 dark:text-theme-200 text-xs">- Usage</span>
          <span className="text-theme-800 dark:text-theme-200 text-xs">- Load</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-none flex flex-row items-center justify-center">
      <FiCpu className="text-theme-800 dark:text-theme-200 w-5 h-5" />
      <div className="flex flex-col ml-3 text-left font-mono">
        <span className="text-theme-800 dark:text-theme-200 text-xs">
          <span className="whitespace-pre">{`${Math.round(data.cpu.usage)}%`.padEnd(3, " ")} Usage</span>
        </span>
        <span className="text-theme-800 dark:text-theme-200 text-xs">
          {`${(Math.round(data.cpu.load * 100) / 100).toFixed(1)}`.padEnd(3, " ")} Load
        </span>
      </div>
    </div>
  );
}
