import useSWR from "swr";
import { FaThermometerHalf } from "react-icons/fa";
import { BiError } from "react-icons/bi";
import { useTranslation } from "next-i18next";

import UsageBar from "./usage-bar";

function convertToFahrenheit(t) {
  return t * 9/5 + 32
}

export default function CpuTemp({ expanded, units }) {
  const { t } = useTranslation();

  const { data, error } = useSWR(`/api/widgets/resources?type=cputemp`, {
    refreshInterval: 1500,
  });

  if (error || data?.error) {
    return (
      <div className="flex-none flex flex-row items-center mr-3 py-1.5">
        <BiError className="text-theme-800 dark:text-theme-200 w-5 h-5" />
        <div className="flex flex-col ml-3 text-left">
          <span className="text-theme-800 dark:text-theme-200 text-xs">{t("widget.api_error")}</span>
        </div>
      </div>
    );
  }

  if (!data || !data.cputemp) {
    return (
      <div className="flex-none flex flex-row items-center mr-3 py-1.5 animate-pulse">
        <FaThermometerHalf className="text-theme-800 dark:text-theme-200 w-5 h-5" />
        <div className="flex flex-col ml-3 text-left min-w-[85px]">
          <span className="text-theme-800 dark:text-theme-200 text-xs flex flex-row justify-between">
            <div className="pl-0.5">-</div>
            <div className="pr-1">{t("resources.temp")}</div>
          </span>
          {expanded && (
            <span className="text-theme-800 dark:text-theme-200 text-xs flex flex-row justify-between">
              <div className="pl-0.5">-</div>
              <div className="pr-1">{t("resources.max")}</div>
            </span>
          )}
        </div>
      </div>
    );
  }

  let minTemp = 0;
  let mainTemp = data.cputemp.main;
  if (data.cputemp.cores?.length) {
    mainTemp = data.cputemp.cores.reduce((a, b) => a + b) / data.cputemp.cores.length;
    minTemp = Math.min(...data.cputemp.cores);
  }
  const unit = units === "imperial" ? "fahrenheit" : "celsius";
  mainTemp = (unit === "celsius") ? mainTemp : convertToFahrenheit(mainTemp);
  const maxTemp = (unit === "celsius") ? data.cputemp.max : convertToFahrenheit(data.cputemp.max);
  const percent = Math.round(((mainTemp - minTemp) / (maxTemp - minTemp)) * 100);

  return (
    <div className="flex-none flex flex-row items-center mr-3 py-1.5">
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
          <div className="pr-1">{t("resources.temp")}</div>
        </span>
        {expanded && (
          <span className="text-theme-800 dark:text-theme-200 text-xs flex flex-row justify-between">
            <div className="pl-0.5">
              {t("common.number", {
                value: maxTemp,
                maximumFractionDigits: 1,
                style: "unit",
                unit
              })}
            </div>
            <div className="pr-1">{t("resources.max")}</div>
          </span>
        )}
        <UsageBar percent={percent} />
      </div>
    </div>
  );
}
