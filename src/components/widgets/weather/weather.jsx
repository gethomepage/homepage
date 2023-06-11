import useSWR from "swr";
import { useState } from "react";
import { WiCloudDown } from "react-icons/wi";
import { MdLocationDisabled, MdLocationSearching } from "react-icons/md";
import { useTranslation } from "next-i18next";

import Error from "../widget/error";
import Container from "../widget/container";
import PrimaryText from "../widget/primary_text";
import SecondaryText from "../widget/secondary_text";
import WidgetIcon from "../widget/widget_icon";
import ContainerButton from "../widget/container_button";

import Icon from "./icon";

function Widget({ options }) {
  const { t, i18n } = useTranslation();

  const { data, error } = useSWR(
    `/api/widgets/weather?${new URLSearchParams({ lang: i18n.language, ...options }).toString()}`
  );

  if (error || data?.error) {
    return <Error options={options} />
  }

  if (!data) {
    return <Container options={options}>
      <PrimaryText>{t("weather.updating")}</PrimaryText>
      <SecondaryText>{t("weather.wait")}</SecondaryText>
      <WidgetIcon icon={WiCloudDown} size="l" />
    </Container>;
  }

  const unit = options.units === "metric" ? "celsius" : "fahrenheit";
  const weatherInfo = {
    condition: data.current.condition.code,
    timeOfDay: data.current.is_day ? "day" : "night",
  };

  return <Container options={options}>
    <PrimaryText>
      {options.label && `${options.label}, `}
      {t("common.number", {
        value: options.units === "metric" ? data.current.temp_c : data.current.temp_f,
        style: "unit",
        unit,
      })}
    </PrimaryText>
    <SecondaryText>{data.current.condition.text}</SecondaryText>
    <WidgetIcon icon={Icon} size="xl" weatherInfo={weatherInfo} />
  </Container>;
}

export default function WeatherApi({ options }) {
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

  if (!location) {
    return <ContainerButton options={options} callback={requestLocation} >
      <PrimaryText>{t("weather.current")}</PrimaryText>
      <SecondaryText>{t("weather.allow")}</SecondaryText>
      <WidgetIcon icon={requesting ? MdLocationSearching : MdLocationDisabled} size="m" pulse />
    </ContainerButton>;
  }

  return <Widget options={{ ...location, ...options }} />;
}
