import useSWR from "swr";
import { useState } from "react";
import { WiCloudDown } from "react-icons/wi";
import { MdLocationDisabled, MdLocationSearching } from "react-icons/md";
import { useTranslation } from "next-i18next";
import classNames from "classnames";

import Error from "../error";

import Icon from "./icon";

function Widget({ options }) {
  const { t, i18n } = useTranslation();

  const { data, error } = useSWR(
    `/api/widgets/openweathermap?${new URLSearchParams({ lang: i18n.language, ...options }).toString()}`
  );

  if (error || data?.cod === 401 || data?.error) {
    return <Error options={options} />
  }

  if (!data) {
    return (
      <div className={classNames(
        "flex flex-col justify-center first:ml-auto ml-4 mr-2",
        options?.styleBoxed === true && " ml-4 mt-2 m:mb-0 rounded-md shadow-md shadow-theme-900/10 dark:shadow-theme-900/20 bg-theme-100/20 dark:bg-white/5 p-3",
      )}>
        <div className="flex flex-row items-center justify-end">
          <div className="hidden sm:flex flex-col items-center">
            <WiCloudDown className="w-8 h-8 text-theme-800 dark:text-theme-200" />
          </div>
          <div className="flex flex-col ml-3 text-left">
            <span className="text-theme-800 dark:text-theme-200 text-sm">{t("weather.updating")}</span>
            <span className="text-theme-800 dark:text-theme-200 text-xs">{t("weather.wait")}</span>
          </div>
        </div>
      </div>
    );
  }

  const unit = options.units === "metric" ? "celsius" : "fahrenheit";

  return (
    <div className={classNames(
      "flex flex-col justify-center first:ml-auto ml-2 mr-2",
      options?.styleBoxed === true && " ml-4 mt-2 m:mb-0 rounded-md shadow-md shadow-theme-900/10 dark:shadow-theme-900/20 bg-theme-100/20 dark:bg-white/5 p-3",
    )}>
      <div className="flex flex-row items-center justify-end">
        <div className="hidden sm:flex flex-col items-center">
          <Icon
            condition={data.weather[0].id}
            timeOfDay={data.dt > data.sys.sunrise && data.dt < data.sys.sunset ? "day" : "night"}
          />
        </div>
        <div className="flex flex-col ml-3 text-left">
          <span className="text-theme-800 dark:text-theme-200 text-sm">
            {options.label && `${options.label}, `}
            {t("common.number", { value: data.main.temp, style: "unit", unit })}
          </span>
          <span className="text-theme-800 dark:text-theme-200 text-xs">{data.weather[0].description}</span>
        </div>
      </div>
    </div>
  );
}

export default function OpenWeatherMap({ options }) {
  const { t } = useTranslation();
  const [location, setLocation] = useState(false);
  const [requesting, setRequesting] = useState(false);

  if (!location && options.latitude && options.longitude) {
    setLocation({ latitude: options.latitude, longitude: options.longitude });
  }

  const requestLocation = () => {
    setRequesting(true);
    if (typeof window !== "undefined") {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({ latitude: position.coords.latitude, longitude: position.coords.longitude });
          setRequesting(false);
        },
        () => {
          setRequesting(false);
        },
        {
          enableHighAccuracy: true,
          maximumAge: 1000 * 60 * 60 * 3,
          timeout: 1000 * 30,
        }
      );
    }
  };

  // if (!requesting && !location) requestLocation();

  if (!location) {
    return (
      <button
        type="button"
        onClick={() => requestLocation()}
        className={classNames(
          "flex flex-col justify-center first:ml-auto ml-4 mr-2",
          options?.styleBoxed === true && " ml-4 mt-2 m:mb-0 rounded-md shadow-md shadow-theme-900/10 dark:shadow-theme-900/20 bg-theme-100/20 dark:bg-white/5 p-3",
        )}
      >
        <div className="flex flex-row items-center justify-end">
          <div className="hidden sm:flex flex-col items-center">
            {requesting ? (
              <MdLocationSearching className="w-6 h-6 text-theme-800 dark:text-theme-200 animate-pulse" />
            ) : (
              <MdLocationDisabled className="w-6 h-6 text-theme-800 dark:text-theme-200" />
            )}
          </div>
          <div className="flex flex-col ml-3 text-left">
            <span className="text-theme-800 dark:text-theme-200 text-sm">{t("weather.current")}</span>
            <span className="text-theme-800 dark:text-theme-200 text-xs">{t("weather.allow")}</span>
          </div>
        </div>
      </button>
    );
  }

  return <Widget options={{ ...location, ...options }} />;
}
