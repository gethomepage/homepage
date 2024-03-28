import useSWR from "swr";
import { useState } from "react";
import { WiCloudDown } from "react-icons/wi";
import { MdLocationDisabled, MdLocationSearching } from "react-icons/md";
import { useTranslation } from "next-i18next";

import Error from "../widget/error";
import Container from "../widget/container";
import ContainerButton from "../widget/container_button";
import WidgetIcon from "../widget/widget_icon";
import PrimaryText from "../widget/primary_text";
import SecondaryText from "../widget/secondary_text";
import mapIcon from "../../../utils/weather/openmeteo-condition-map";

function Widget({ options }) {
  const { t } = useTranslation();

  const { data, error } = useSWR(`/api/widgets/openmeteo?${new URLSearchParams({ ...options }).toString()}`);

  if (error || data?.error) {
    return <Error options={options} />;
  }

  if (!data) {
    return (
      <Container options={options} additionalClassNames="information-widget-openmeteo">
        <PrimaryText>{t("weather.updating")}</PrimaryText>
        <SecondaryText>{t("weather.wait")}</SecondaryText>
        <WidgetIcon icon={WiCloudDown} size="l" />
      </Container>
    );
  }

  const unit = options.units === "metric" ? "celsius" : "fahrenheit";
  const condition = data.current_weather.weathercode;
  const timeOfDay =
    data.current_weather.time > data.daily.sunrise[0] && data.current_weather.time < data.daily.sunset[0]
      ? "day"
      : "night";

  return (
    <Container options={options} additionalClassNames="information-widget-openmeteo">
      <PrimaryText>
        {options.label && `${options.label}, `}
        {t("common.number", {
          value: data.current_weather.temperature,
          style: "unit",
          unit,
          ...options.format,
        })}
      </PrimaryText>
      <SecondaryText>{t(`wmo.${data.current_weather.weathercode}-${timeOfDay}`)}</SecondaryText>
      <WidgetIcon icon={mapIcon(condition, timeOfDay)} size="xl" />
    </Container>
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
        },
      );
    }
  };

  if (!location) {
    return (
      <ContainerButton
        options={options}
        callback={requestLocation}
        additionalClassNames="information-widget-openmeteo-location-button"
      >
        <PrimaryText>{t("weather.current")}</PrimaryText>
        <SecondaryText>{t("weather.allow")}</SecondaryText>
        <WidgetIcon icon={requesting ? MdLocationSearching : MdLocationDisabled} size="m" pulse />
      </ContainerButton>
    );
  }

  return <Widget options={{ ...location, ...options }} />;
}
