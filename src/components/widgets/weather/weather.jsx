import useSWR from "swr";
import { BiError } from "react-icons/bi";
import { useTranslation } from "react-i18next";

import Icon from "./icon";

export default function WeatherApi({ options }) {
  const { t, i18n } = useTranslation();

  const { data, error } = useSWR(
    `/api/widgets/weather?${new URLSearchParams({ lang: i18n.language, ...options }).toString()}`
  );

  if (error) {
    return (
      <div className="flex flex-col">
        <div className="flex flex-row items-center justify-end">
          <div className="flex flex-col items-center">
            <BiError className="w-8 h-8 text-theme-800 dark:text-theme-200" />
            <div className="flex flex-col ml-3 text-left">
              <span className="text-theme-800 dark:text-theme-200 text-sm">API</span>
              <span className="text-theme-800 dark:text-theme-200 text-xs">Error</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return <div className="flex flex-row items-center justify-end" />;
  }

  if (data.error) {
    return <div className="flex flex-row items-center justify-end" />;
  }

  const unit = options.units === "metric" ? "celsius" : "fahrenheit";

  return (
    <div className="flex flex-col justify-center">
      <div className="flex flex-row items-center justify-end">
        <div className="flex flex-col items-center">
          <Icon condition={data.current.condition.code} timeOfDay={data.current.is_day ? "day" : "night"} />
        </div>
        <div className="flex flex-col ml-3 text-left">
          <span className="text-theme-800 dark:text-theme-200 text-sm">
            {options.label && `${options.label}, `}
            {t("common.number", {
              value: options.units === "metric" ? data.current.temp_c : data.current.temp_f,
              style: "unit",
              unit,
            })}
          </span>
          <span className="text-theme-800 dark:text-theme-200 text-xs">{data.current.condition.text}</span>
        </div>
      </div>
    </div>
  );
}
