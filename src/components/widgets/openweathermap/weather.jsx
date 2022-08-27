import useSWR from "swr";
import { BiError } from "react-icons/bi";

import Icon from "./icon";

export default function OpenWeatherMap({ options }) {
  const { data, error } = useSWR(
    `/api/widgets/openweathermap?lat=${options.latitude}&lon=${options.longitude}&apiKey=${options.apiKey}&duration=${options.cache}`
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
  // OpenWeatherMap returns temperature in Kelvins
  var temp_c = data.main.temp - 273.15; 
  var temp_f = temp_c * 9 / 5 + 32;
  return (
    <div className="order-last grow flex-none flex flex-row items-center justify-end">
      <Icon condition={data.weather[0].id} timeOfDay={(data.dt > data.sys.sunrise) && (data.dt < data.sys.sundown) ? "day" : "night"} />
      <div className="flex flex-col ml-3 text-left">
        <span className="text-theme-800 dark:text-theme-200 text-sm">
          {options.units === "metric" ? temp_c.toFixed(0) : temp_f.toFixed(0)}&deg;
        </span>
        <span className="text-theme-800 dark:text-theme-200 text-xs">{data.weather[0].description}</span>
      </div>
    </div>
  );
}
