import useSWR from "swr";
import { FaCarBattery } from "react-icons/fa";
import { useTranslation } from "next-i18next";

import Error from "../widget/error";
import Resource from "../widget/resource";

export default function Widget({ options }) {
  const { t } = useTranslation();
  const { expanded } = options;
  let { refresh } = options;
  if (!refresh) refresh = 1500;

  const { data, error } = useSWR(
    `/api/widgets/peanut?${new URLSearchParams({ ...options }).toString()}`,
    {
      refreshInterval: refresh,
    },
  );

  if (error || data?.error) {
    return <Error options={options} />;
  }

  if (!data) {
    return (
      <Resource
        icon={FaCarBattery}
        value="-"
        label="Load"
        expandedValue="-"
        expandedLabel="Battery"
        expanded={expanded}
        percentage="0"
      />
    );
  }

  return (
    <Resource
      icon={FaCarBattery}
      value={t("common.number", {
        value: data['ups.load'],
        style: "unit",
        unit: "percent",
        maximumFractionDigits: 0,
      })}
      label="Load"
      expandedValue={t("common.number", {
        value: data['battery.charge'],
        style: "unit",
        unit: "percent",
        maximumFractionDigits: 0,
      })}
      expandedLabel="Battery"
      percentage={data['ups.load']}
      expanded={expanded}
    />
  );
}
