import useSWR from "swr";
import { BiError } from "react-icons/bi";

import Icon from "./icon";

export default function OpenWeatherMap({ options }) {
  const { data, error } = useSWR(
    `/api/widgets/openweathermap?lat=${options.latitude}&lon=${options.longitude}&apiKey=${options.apiKey}&duration=${options.cache}&units=${options.units}`
  );

  if (error || data?.cod == 401) {
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
    return <div className="flex flex-row items-center"></div>;
  }

  if (data.error) {
    return <div className="flex flex-row items-center"></div>;
  }

  return (
    <div className="flex flex-col justify-center">
      <div className="flex flex-row items-center justify-end">
        <div className="flex flex-col items-center">
          <Icon
            condition={data.weather[0].id}
            timeOfDay={data.dt > data.sys.sunrise && data.dt < data.sys.sundown ? "day" : "night"}
          />
        </div>
        <div className="flex flex-col ml-3 text-left">
          <span className="text-theme-800 dark:text-theme-200 text-sm">
            {options.label && `${options.label}, `}
            {data.main.temp.toFixed(1)}&deg;
          </span>
          <span className="text-theme-800 dark:text-theme-200 text-xs">
            {data.weather[0].description.charAt(0).toUpperCase() + data.weather[0].description.slice(1)}
          </span>
        </div>
      </div>
    </div>
  );
}
