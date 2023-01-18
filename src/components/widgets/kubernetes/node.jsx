import { FaMemory } from "react-icons/fa";
import { FiAlertTriangle, FiCpu, FiServer } from "react-icons/fi";
import { SiKubernetes } from "react-icons/si";
import { useTranslation } from "next-i18next";

import UsageBar from "./usage-bar";


export default function Node({ type, options, data }) {
  const { t } = useTranslation();


  function icon() {
    if (type === "cluster") {
      return <SiKubernetes className="text-theme-800 dark:text-theme-200 w-5 h-5" />;
    }
    if (data.ready) {
      return <FiServer className="text-theme-800 dark:text-theme-200 w-5 h-5" />;
    }
    return <FiAlertTriangle className="text-theme-800 dark:text-theme-200 w-5 h-5" />;
  }

  return (
    <div className="flex flex-col max-w:full sm:basis-auto self-center grow-0 flex-wrap ml-4">
      <div className="flex flex-row self-center flex-wrap justify-between">
        <div className="flex-none flex flex-row items-center mr-3 py-1.5">
          {icon()}
          <div className="flex flex-col ml-3 text-left min-w-[85px]">
            <div className="text-theme-800 dark:text-theme-200 text-xs flex flex-row justify-between">
              <div className="pl-0.5">
                {t("common.number", {
                  value: data.cpu.percent,
                  style: "unit",
                  unit: "percent",
                  maximumFractionDigits: 0
                })}
              </div>
              <FiCpu className="text-theme-800 dark:text-theme-200 w-3 h-3" />
            </div>
            <UsageBar percent={data.cpu.percent} />
            <div className="text-theme-800 dark:text-theme-200 text-xs flex flex-row justify-between">
              <div className="pl-0.5">
                {t("common.bytes", {
                  value: data.memory.free,
                  maximumFractionDigits: 0,
                  binary: true
                })}
              </div>
              <FaMemory className="text-theme-800 dark:text-theme-200 w-3 h-3" />
            </div>
            <UsageBar percent={data.memory.percent} />
            {options.showLabel && (
              <div className="pt-1 text-center text-theme-800 dark:text-theme-200 text-xs">{type === "cluster" ? options.label : data.name}</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
