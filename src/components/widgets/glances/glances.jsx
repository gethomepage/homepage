import useSWR from "swr";
import { useContext } from "react";
import { FaMemory, FaRegClock, FaThermometerHalf } from "react-icons/fa";
import { FiCpu, FiHardDrive } from "react-icons/fi";
import { useTranslation } from "next-i18next";
import classNames from "classnames";

import UsageBar from "../resources/usage-bar";
import Error from "../error";

import { SettingsContext } from "utils/contexts/settings";

const cpuSensorLabels = ["cpu_thermal", "Core", "Tctl"];

function convertToFahrenheit(t) {
  return t * 9/5 + 32
}

export default function Widget({ options }) {
  const { t, i18n } = useTranslation();
  const { settings } = useContext(SettingsContext);

  const { data, error } = useSWR(
    `/api/widgets/glances?${new URLSearchParams({ lang: i18n.language, ...options }).toString()}`, {
      refreshInterval: 1500,
    }
  );

  if (error || data?.error) {
    return <Error options={options} />
  }

  if (!data) {
    return (
      <div className={classNames(
        "flex flex-col max-w:full sm:basis-auto self-center grow-0 flex-wrap ml-4",
        options?.styleBoxed === true && " mb-0 sm:mb-0 rounded-md shadow-md shadow-theme-900/10 dark:shadow-theme-900/20 bg-theme-100/20 dark:bg-white/5 p-3",
      )}>
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

  let disks = [];

  if (options.disk) {
    disks = Array.isArray(options.disk)
      ? options.disk.map((disk) => data.fs.find((d) => d.mnt_point === disk)).filter((d) => d)
      : [data.fs.find((d) => d.mnt_point === options.disk)].filter((d) => d);
  }

  return (
    <a href={options.url} target={settings.target ?? "_blank"}  className={classNames(
      "flex flex-col max-w:full sm:basis-auto self-center grow-0 flex-wrap",
      options?.styleBoxed === true && " mb-0 mt-2 sm:mb-0 rounded-md shadow-md shadow-theme-900/10 dark:shadow-theme-900/20 bg-theme-100/20 dark:bg-white/5 p-3",
    )}>
      <div className="flex flex-row self-center flex-wrap justify-between">
         <div className="flex-none flex flex-row items-center mr-3 py-1.5">
          <FiCpu className="text-theme-800 dark:text-theme-200 w-5 h-5" />
          <div className="flex flex-col ml-3 text-left min-w-[85px]">
            <div className="text-theme-800 dark:text-theme-200 text-xs flex flex-row justify-between">
              <div className="pl-0.5">
                {t("common.number", {
                  value: data.cpu.total,
                  style: "unit",
                  unit: "percent",
                  maximumFractionDigits: 0,
                })}
              </div>
              <div className="pr-1">{t("glances.cpu")}</div>
            </div>
            {options.expanded && (
              <span className="text-theme-800 dark:text-theme-200 text-xs flex flex-row justify-between">
                <div className="pl-0.5 pr-1">
                {t("common.number", {
                  value: data.load.min15,
                  style: "unit",
                  unit: "percent",
                  maximumFractionDigits: 0,
                })}
                </div>
                <div className="pr-1">{t("glances.load")}</div>
              </span>
            )}
            <UsageBar percent={data.cpu.total} />
          </div>
        </div>
        <div className="flex-none flex flex-row items-center mr-3 py-1.5">
          <FaMemory className="text-theme-800 dark:text-theme-200 w-5 h-5" />
          <div className="flex flex-col ml-3 text-left min-w-[85px]">
            <div className="text-theme-800 dark:text-theme-200 text-xs flex flex-row justify-between">
              <div className="pl-0.5">
                {t("common.bytes", {
                  value: data.mem.free,
                  maximumFractionDigits: 1,
                  binary: true,
                })}
              </div>
              <div className="pr-1">{t("glances.free")}</div>
            </div>
            {options.expanded && (
              <span className="text-theme-800 dark:text-theme-200 text-xs flex flex-row justify-between">
                <div className="pl-0.5 pr-1">
                  {t("common.bytes", {
                    value: data.mem.total,
                    maximumFractionDigits: 1,
                    binary: true,
                  })}
                </div>
                <div className="pr-1">{t("glances.total")}</div>
              </span>
            )}
            <UsageBar percent={data.mem.percent} />
          </div>
        </div>
        {disks.map((disk) => (
          <div key={disk.mnt_point} className="flex-none flex flex-row items-center mr-3 py-1.5">
            <FiHardDrive className="text-theme-800 dark:text-theme-200 w-5 h-5" />
            <div className="flex flex-col ml-3 text-left min-w-[85px]">
              <span className="text-theme-800 dark:text-theme-200 text-xs flex flex-row justify-between">
                <div className="pl-0.5">{t("common.bytes", { value: disk.free })}</div>
                <div className="pr-1">{t("glances.free")}</div>
              </span>
              {options.expanded && (
                <span className="text-theme-800 dark:text-theme-200 text-xs flex flex-row justify-between">
                  <div className="pl-0.5 pr-1">{t("common.bytes", { value: disk.size })}</div>
                  <div className="pr-1">{t("glances.total")}</div>
                </span>
              )}
              <UsageBar percent={disk.percent} />
            </div>
          </div>))}
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
              {options.expanded && (
                <span className="text-theme-800 dark:text-theme-200 text-xs flex flex-row justify-between">
                  <div className="pl-0.5 pr-1">
                  {t("common.number", {
                    value: maxTemp,
                    maximumFractionDigits: 1,
                    style: "unit",
                    unit
                  })}
                  </div>
                  <div className="pr-1">{t("glances.warn")}</div>
                </span>
              )}
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
    </a>
  );
}
