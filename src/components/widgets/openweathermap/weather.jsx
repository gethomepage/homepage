import useSWR from "swr";
import { BiError } from "react-icons/bi";

import Icon from "./icon";

export default function OpenWeatherMap({ options }) {
  const { data, error } = useSWR(
    `/api/widgets/openweathermap?lat=${options.latitude}&lon=${options.longitude}&apiKey=${options.apiKey}&duration=${options.cache}&units=${options.units}`
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
      <Icon condition={data.weather[0].id} timeOfDay={(data.dt > data.sys.sunrise) && (data.dt < data.sys.sundown) ? "day" : "night"} />
      <div className="flex flex-col ml-3 text-left">
        <span className="text-theme-800 dark:text-theme-200 text-sm">
          {data.main.temp.toFixed(1)}&deg;
        </span>
        <span className="text-theme-800 dark:text-theme-200 text-xs">{data.weather[0].description.charAt(0).toUpperCase() + data.weather[0].description.slice(1)}</span>
      </div>
    </div>
  );
}
