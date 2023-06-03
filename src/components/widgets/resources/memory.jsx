import useSWR from "swr";
import { FaMemory } from "react-icons/fa";
import { useTranslation } from "next-i18next";

import SingleResource from "../widget/single_resource";
import WidgetIcon from "../widget/widget_icon";
import ResourceValue from "../widget/resource_value";
import ResourceLabel from "../widget/resource_label";
import Error from "../widget/error";

import UsageBar from "./usage-bar";

export default function Memory({ expanded }) {
  const { t } = useTranslation();

  const { data, error } = useSWR(`/api/widgets/resources?type=memory`, {
    refreshInterval: 1500,
  });

  if (error || data?.error) {
    return <Error />
  }

  if (!data) {
    return <SingleResource expanded={expanded}>
      <WidgetIcon icon={FaMemory} />
      <ResourceValue>-</ResourceValue>
      <ResourceLabel>{t("resources.free")}</ResourceLabel>
      <ResourceValue>-</ResourceValue>
      <ResourceLabel>{t("resources.total")}</ResourceLabel>
      <UsageBar percent={0} />
    </SingleResource>;
  }

  const percent = Math.round((data.memory.active / data.memory.total) * 100);

  return <SingleResource expanded={expanded}>
    <WidgetIcon icon={FaMemory} />
    <ResourceValue>{t("common.bytes", { value: data.memory.available, maximumFractionDigits: 1, binary: true })}</ResourceValue>
    <ResourceLabel>{t("resources.free")}</ResourceLabel>
    <ResourceValue>
      {t("common.bytes", {
        value: data.memory.total,
        maximumFractionDigits: 1,
        binary: true,
      })}
    </ResourceValue>
    <ResourceLabel>{t("resources.total")}</ResourceLabel>
    <UsageBar percent={percent} />
  </SingleResource>;
}
