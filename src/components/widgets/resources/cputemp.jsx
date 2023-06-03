import useSWR from "swr";
import { FaThermometerHalf } from "react-icons/fa";
import { useTranslation } from "next-i18next";

import SingleResource from "../widget/single_resource";
import WidgetIcon from "../widget/widget_icon";
import ResourceValue from "../widget/resource_value";
import ResourceLabel from "../widget/resource_label";
import Error from "../widget/error";

import UsageBar from "./usage-bar";

function convertToFahrenheit(t) {
  return t * 9/5 + 32
}

export default function CpuTemp({ expanded, units }) {
  const { t } = useTranslation();

  const { data, error } = useSWR(`/api/widgets/resources?type=cputemp`, {
    refreshInterval: 1500,
  });

  if (error || data?.error) {
    return <Error />
  }

  if (!data || !data.cputemp) {
    return <SingleResource expanded={expanded}>
      <WidgetIcon icon={FaThermometerHalf} />
      <ResourceValue>-</ResourceValue>
      <ResourceLabel>{t("resources.temp")}</ResourceLabel>
      <ResourceValue>-</ResourceValue>
      <ResourceLabel>{t("resources.max")}</ResourceLabel>
    </SingleResource>
  }

  let mainTemp = data.cputemp.main;
  if (data.cputemp.cores?.length) {
    mainTemp = data.cputemp.cores.reduce((a, b) => a + b) / data.cputemp.cores.length;
  }
  const unit = units === "imperial" ? "fahrenheit" : "celsius";
  mainTemp = (unit === "celsius") ? mainTemp : convertToFahrenheit(mainTemp);
  const maxTemp = (unit === "celsius") ? data.cputemp.max : convertToFahrenheit(data.cputemp.max);

  return <SingleResource expanded={expanded}>
    <WidgetIcon icon={FaThermometerHalf} />
    <ResourceValue>
      {t("common.number", {
        value: mainTemp,
        maximumFractionDigits: 1,
        style: "unit",
        unit
      })}
    </ResourceValue>
    <ResourceLabel>{t("resources.temp")}</ResourceLabel>
    <ResourceValue>
      {t("common.number", {
        value: maxTemp,
        maximumFractionDigits: 1,
        style: "unit",
        unit
      })}
    </ResourceValue>
    <ResourceLabel>{t("resources.max")}</ResourceLabel>
    <UsageBar percent={Math.round((mainTemp / maxTemp) * 100)} />
  </SingleResource>;
}
