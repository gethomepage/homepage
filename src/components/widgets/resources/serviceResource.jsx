import { useTranslation } from "next-i18next";
import { FiCpu, FiServer } from "react-icons/fi";
import { FaMemory } from "react-icons/fa";

import Error from "../widget/error";

import UsageBar from "./usage-bar";

/**
 * Represents a service resource with optional details.
 *
 * @param {Object} props - The properties of the service resource.
 * @param {JSX.Element} [props.icon] - The JSX element representing the icon.
 * @param {string} [props.label] - The label describing the service resource.
 * @param {number} [props.cpuPercent] - The CPU usage percentage.
 * @param {number} [props.memFree] - The amount of free memory.
 * @param {number} [props.memPercent] - The memory usage percentage.
 * @param {any} [props.error] - Any additional error information.
 *
 * @returns {JSX.Element} - The JSX element representing the service resource.
 */
export default function ServiceResource({ icon, label, cpuPercent, memFree, memPercent, error }) {
  const { t } = useTranslation();

  const widgetIcon = icon ?? <FiServer className="text-theme-800 dark:text-theme-200 w-5 h-5" />;

  if (error) {
    return <Error />;
  }

  return (
    <div className="flex flex-col max-w:full sm:basis-auto self-center grow-0 flex-wrap ml-4">
      <div className="flex flex-row self-center flex-wrap justify-between">
        <div className="flex-none flex flex-row items-center mr-3 py-1.5">
          <div className="flex-none w-5 h-5">{widgetIcon}</div>
          <div className="flex flex-col ml-3 text-left min-w-[85px]">
            <div className="text-theme-800 dark:text-theme-200 text-xs flex flex-row justify-between">
              <div className="pl-0.5">
                {t("common.number", {
                  value: cpuPercent ?? 0,
                  style: "unit",
                  unit: "percent",
                  maximumFractionDigits: 0,
                })}
              </div>
              <FiCpu className="text-theme-800 dark:text-theme-200 w-3 h-3" />
            </div>
            <UsageBar percent={cpuPercent ?? 0} />
            <div className="text-theme-800 dark:text-theme-200 text-xs flex flex-row justify-between">
              <div className="pl-0.5">
                {t("common.bytes", {
                  value: memFree ?? 0,
                  maximumFractionDigits: 0,
                  binary: true,
                })}
              </div>
              <FaMemory className="text-theme-800 dark:text-theme-200 w-3 h-3" />
            </div>
            <UsageBar percent={memPercent ?? 0} />
            {label && <div className="pt-1 text-center text-theme-800 dark:text-theme-200 text-xs">{label}</div>}
          </div>
        </div>
      </div>
    </div>
  );
}
