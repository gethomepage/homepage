import useSWR from "swr";
import { FiCpu } from "react-icons/fi";
import { useTranslation } from "next-i18next";

import SingleResource from "../widget/single_resource";
import WidgetIcon from "../widget/widget_icon";
import ResourceValue from "../widget/resource_value";
import ResourceLabel from "../widget/resource_label";
import Error from "../widget/error";

import UsageBar from "./usage-bar";

export default function Cpu({ expanded }) {
  const { t } = useTranslation();

  const { data, error } = useSWR(`/api/widgets/resources?type=cpu`, {
    refreshInterval: 1500,
  });

  if (error || data?.error) {
    return <Error />
  }

  if (!data) {
    return <SingleResource expanded={expanded}>
      <WidgetIcon icon={FiCpu} />
      <ResourceValue>-</ResourceValue>
      <ResourceLabel>{t("resources.cpu")}</ResourceLabel>
      <ResourceValue>-</ResourceValue>
      <ResourceLabel>{t("resources.load")}</ResourceLabel>
      <UsageBar percent={0} />
    </SingleResource>
  }

  return <SingleResource expanded={expanded}>
    <WidgetIcon icon={FiCpu} />
    <ResourceValue>
      {t("common.number", {
        value: data.cpu.usage,
        style: "unit",
        unit: "percent",
        maximumFractionDigits: 0,
      })}
    </ResourceValue>
    <ResourceLabel>{t("resources.cpu")}</ResourceLabel>
    <ResourceValue>
      {t("common.number", {
        value: data.cpu.load,
        maximumFractionDigits: 2,
      })}
    </ResourceValue>
    <ResourceLabel>{t("resources.load")}</ResourceLabel>
    <UsageBar percent={data.cpu.usage} />
  </SingleResource>
}
