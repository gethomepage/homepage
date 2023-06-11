import useSWR from "swr";
import { useState } from "react";
import { BiError } from "react-icons/bi";
import { WiCloudDown } from "react-icons/wi";
import { MdLocationDisabled, MdLocationSearching } from "react-icons/md";
import { useTranslation } from "next-i18next";

import Icon from "./icon";

function Widget({ options }) {
  const { t } = useTranslation();

  const { data, error } = useSWR(
    `/api/widgets/openmeteo?${new URLSearchParams({ ...options }).toString()}`
  );

  if (error || data?.error) {
    return (
      <div className="flex flex-col justify-center first:ml-0 ml-4 mr-2">
        <div className="flex flex-row items-center justify-end">
          <div className="flex flex-col items-center">
            <BiError className="w-8 h-8 text-theme-800 dark:text-theme-200" />
            <div className="flex flex-col ml-3 text-left">
              <span className="text-theme-800 dark:text-theme-200 text-sm">{t("widget.api_error")}</span>
              <span className="text-theme-800 dark:text-theme-200 text-xs">-</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex flex-col justify-center first:ml-0 ml-4 mr-2">
        <div className="flex flex-row items-center justify-end">
          <div className="flex flex-col items-center">
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
  const timeOfDay = data.current_weather.time > data.daily.sunrise[0] && data.current_weather.time < data.daily.sunset[0] ? "day" : "night";

  return (
    <div className="flex flex-col justify-center first:ml-0 ml-4 mr-2">
      <div className="flex flex-row items-center justify-end">
        <div className="flex flex-col items-center">
          <Icon condition={data.current_weather.weathercode} timeOfDay={timeOfDay} />
        </div>
        <div className="flex flex-col ml-3 text-left">
          <span className="text-theme-800 dark:text-theme-200 text-sm">
            {options.label && `${options.label}, `}
            {t("common.number", {
              value: data.current_weather.temperature,
              style: "unit",
              unit,
            })}
          </span>
          <span className="text-theme-800 dark:text-theme-200 text-xs">{t(`wmo.${data.current_weather.weathercode}-${timeOfDay}`)}</span>
        </div>
      </div>
    </div>
  );
}

export default function OpenMeteo({ options }) {
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
        className="flex flex-col justify-center first:ml-0 ml-4 mr-2"
      >
        <div className="flex flex-row items-center justify-end">
          <div className="flex flex-col items-center">
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
