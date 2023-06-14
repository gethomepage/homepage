import useSWR from "swr";
import { FaMemory } from "react-icons/fa";
import { useTranslation } from "next-i18next";

import Resource from "../widget/resource";
import Error from "../widget/error";

export default function Memory({ expanded }) {
  const { t } = useTranslation();

  const { data, error } = useSWR(`/api/widgets/resources?type=memory`, {
    refreshInterval: 1500,
  });

  if (error || data?.error) {
    return <Error />
  }

  if (!data) {
    return <Resource
      icon={FaMemory}
      value="-"
      label={t("resources.free")}
      expandedValue="-"
      expandedLabel={t("resources.total")}
      expanded={expanded}
      percentage="0"
    />;
  }

  const percent = Math.round((data.memory.active / data.memory.total) * 100);

  return <Resource
    icon={FaMemory}
    value={t("common.bytes", { value: data.memory.available, maximumFractionDigits: 1, binary: true })}
    label={t("resources.free")}
    expandedValue={t("common.bytes", { value: data.memory.total, maximumFractionDigits: 1, binary: true })}
    expandedLabel={t("resources.total")}
    percentage={percent}
    expanded={expanded}
  />;
}
