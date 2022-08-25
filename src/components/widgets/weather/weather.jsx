import useSWR from "swr";
import { BiError } from "react-icons/bi";

import Icon from "./icon";

export default function Weather({ options }) {
  const { data, error } = useSWR(
    `/api/widgets/weather?lat=${options.latitude}&lon=${options.longitude}&apiKey=${options.apiKey}&duration=${options.cache}`
  );

  if (error) {
    return (
      <div className="order-last grow flex-none flex flex-row items-center justify-end">
        <BiError className="w-8 h-8 text-theme-800 dark:text-theme-200" />
        <div className="flex flex-col ml-3 text-left">
          <span className="text-theme-800 dark:text-theme-200 text-sm">API</span>
          <span className="text-theme-800 dark:text-theme-200 text-xs">Error</span>
        </div>
      </div>
    );
  }

  if (!data) {
    return <div className="order-last grow flex-none flex flex-row items-center justify-end"></div>;
  }

  if (data.error) {
    return <div className="order-last grow flex-none flex flex-row items-center justify-end"></div>;
  }

  return (
    <div className="order-last grow flex-none flex flex-row items-center justify-end">
      <Icon condition={data.current.condition.code} timeOfDay={data.current.is_day ? "day" : "night"} />
      <div className="flex flex-col ml-3 text-left">
        <span className="text-theme-800 dark:text-theme-200 text-sm">
          {options.units === "metric" ? data.current.temp_c : data.current.temp_f}&deg;
        </span>
        <span className="text-theme-800 dark:text-theme-200 text-xs">{data.current.condition.text}</span>
      </div>
    </div>
  );
}
