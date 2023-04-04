import useSWR from "swr";
import { BiError } from "react-icons/bi";
import { FaMemory, FaRegClock, FaThermometerHalf } from "react-icons/fa";
import { FiCpu } from "react-icons/fi";
import { useTranslation } from "next-i18next";

import UsageBar from "../resources/usage-bar";

const cpuSensorLabels = ["cpu_thermal", "Core"];

function convertToFahrenheit(t) {
  return t * 9/5 + 32
}

export default function Widget({ options }) {
  const { t, i18n } = useTranslation();

  const { data, error } = useSWR(
    `/api/widgets/glances?${new URLSearchParams({ lang: i18n.language, ...options }).toString()}`, {
      refreshInterval: 1500,
    }
  );

  if (error || data?.error) {
    return (
      <div className="flex flex-col justify-center first:ml-0 ml-4">
        <div className="flex flex-row items-center justify-end">
          <div className="flex flex-row items-center">
            <BiError className="w-8 h-8 text-theme-800 dark:text-theme-200" />
            <div className="flex flex-col ml-3 text-left">
              <span className="text-theme-800 dark:text-theme-200 text-sm">{t("widget.api_error")}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex flex-col max-w:full sm:basis-auto self-center grow-0 flex-wrap ml-4">
        <div className="flex flex-row self-center flex-wrap justify-between">
           <div className="flex-none flex flex-row items-center mr-3 py-1.5">
            <FiCpu className="text-theme-800 dark:text-theme-200 w-5 h-5" />
            <div className="flex flex-col ml-3 text-left min-w-[85px]">
              <div className="text-theme-800 dark:text-theme-200 text-xs flex flex-row justify-between">
                <div className="pl-0.5 text-xs">
                  {t("glances.wait")}
                </div>
              </div>
              <UsageBar percent="0" />
            </div>
          </div>
          <div className="flex-none flex flex-row items-center mr-3 py-1.5">
            <FaMemory className="text-theme-800 dark:text-theme-200 w-5 h-5" />
            <div className="flex flex-col ml-3 text-left min-w-[85px]">
              <div className="text-theme-800 dark:text-theme-200 text-xs flex flex-row justify-between">
                <div className="pl-0.5 text-xs">
                  {t("glances.wait")}
                </div>
              </div>
              <UsageBar percent="0" />
            </div>
          </div>
        </div>
        {options.label && (
          <div className="ml-6 pt-1 text-center text-theme-800 dark:text-theme-200 text-xs">{options.label}</div>
        )}
      </div>
    );
  }

  const unit = options.units === "imperial" ? "fahrenheit" : "celsius";
  let mainTemp = 0;
  let maxTemp = 80;
  const cpuSensors = data.sensors?.filter(s => cpuSensorLabels.some(label => s.label.startsWith(label)) && s.type === "temperature_core");
  if (options.cputemp && cpuSensors) {
    try {
      mainTemp = cpuSensors.reduce((acc, s) => acc + s.value, 0) / cpuSensors.length;
      maxTemp = Math.max(cpuSensors.reduce((acc, s) => acc + s.warning, 0) / cpuSensors.length, maxTemp);
      if (unit === "fahrenheit") {
        mainTemp = convertToFahrenheit(mainTemp);
        maxTemp = convertToFahrenheit(maxTemp);
      }
    } catch (e) {
      // cpu sensor retrieval failed
    }
  }
  const tempPercent = Math.round((mainTemp / maxTemp) * 100);

  return (
    <div className="flex flex-col max-w:full sm:basis-auto self-center grow-0 flex-wrap ml-4">
      <div className="flex flex-row self-center flex-wrap justify-between">
         <div className="flex-none flex flex-row items-center mr-3 py-1.5">
          <FiCpu className="text-theme-800 dark:text-theme-200 w-5 h-5" />
          <div className="flex flex-col ml-3 text-left min-w-[85px]">
            <div className="text-theme-800 dark:text-theme-200 text-xs flex flex-row justify-between">
              <div className="pl-0.5">
                {t("common.number", {
                  value: data.quicklook.cpu,
                  style: "unit",
                  unit: "percent",
                  maximumFractionDigits: 0,
                })}
              </div>
              <div className="pr-1">{t("glances.cpu")}</div>
            </div>
            <UsageBar percent={data.quicklook.cpu} />
          </div>
        </div>
        <div className="flex-none flex flex-row items-center mr-3 py-1.5">
          <FaMemory className="text-theme-800 dark:text-theme-200 w-5 h-5" />
          <div className="flex flex-col ml-3 text-left min-w-[85px]">
            <div className="text-theme-800 dark:text-theme-200 text-xs flex flex-row justify-between">
              <div className="pl-0.5">
                {t("common.number", {
                  value: data.quicklook.mem,
                  style: "unit",
                  unit: "percent",
                  maximumFractionDigits: 0,
                })}
              </div>
              <div className="pr-1">{t("glances.mem")}</div>
            </div>
            <UsageBar percent={data.quicklook.mem} />
          </div>
        </div>
        {options.cputemp && mainTemp > 0 &&
            (<div className="flex-none flex flex-row items-center mr-3 py-1.5">
            <FaThermometerHalf className="text-theme-800 dark:text-theme-200 w-5 h-5" />
            <div className="flex flex-col ml-3 text-left min-w-[85px]">
              <span className="text-theme-800 dark:text-theme-200 text-xs flex flex-row justify-between">
                <div className="pl-0.5">
                  {t("common.number", { 
                    value: mainTemp,
                    maximumFractionDigits: 1,
                    style: "unit",
                    unit
                  })}
                </div>
                <div className="pr-1">{t("glances.temp")}</div>
              </span>
              <UsageBar percent={tempPercent} />
            </div>
          </div>)}
        {options.uptime && data.uptime &&
            (<div className="flex-none flex flex-row items-center mr-3 py-1.5">
            <FaRegClock className="text-theme-800 dark:text-theme-200 w-5 h-5" />
            <div className="flex flex-col ml-3 text-left min-w-[85px]">
              <span className="text-theme-800 dark:text-theme-200 text-xs flex flex-row justify-between">
                <div className="pl-0.5">
                  {data.uptime.replace(" days,", t("glances.days")).replace(/:\d\d:\d\d$/g, t("glances.hours"))}
                </div>
                <div className="pr-1">{t("glances.uptime")}</div>
              </span>
              <UsageBar percent={Math.round((new Date().getSeconds() / 60) * 100)} />
            </div>
          </div>)}
      </div>
      {options.label && (
        <div className="pt-1 text-center text-theme-800 dark:text-theme-200 text-xs">{options.label}</div>
      )}
    </div>
  );
}
