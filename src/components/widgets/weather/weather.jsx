import useSWR from "swr";
import { BiError } from "react-icons/bi";

import Icon from "./icon";

export default function Weather({ options }) {
  const { data, error } = useSWR(
    `/api/widgets/weather?lat=${options.latitude}&lon=${options.longitude}&apiKey=${options.apiKey}&duration=${options.cache}`
  );

  if (error) {
    return (
      <div className="flex flex-row items-center">
        <BiError className="w-8 h-8 text-theme-800 dark:text-theme-200" />
        <div className="flex flex-col ml-3 text-left">
          <span className="text-theme-800 dark:text-theme-200 text-sm">API</span>
          <span className="text-theme-800 dark:text-theme-200 text-xs">Error</span>
        </div>
      </div>
    );
  }

  if (!data) {
    return <div className="flex flex-row items-center"></div>;
  }

  if (data.error) {
    return <div className="flex flex-row items-center"></div>;
  }

  return (
    <div className=" flex flex-col">
      <div className="flex flex-row items-center justify-end">
        <div className="flex flex-col items-center">
          <Icon condition={data.current.condition.code} timeOfDay={data.current.is_day ? "day" : "night"} />
        </div>
        <div className="flex flex-col ml-3 text-left">
          <span className="text-theme-800 dark:text-theme-200 text-sm">
            {options.label && `${options.label}, `}
            {options.units === "metric" ? data.current.temp_c : data.current.temp_f}&deg;
          </span>
          <span className="text-theme-800 dark:text-theme-200 text-xs">{data.current.condition.text}</span>
        </div>
      </div>
    </div>
  );
}
