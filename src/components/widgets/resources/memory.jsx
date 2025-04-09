import { useTranslation } from "next-i18next";
import { FaMemory } from "react-icons/fa";
import useSWR from "swr";

import Error from "../widget/error";
import Resource from "../widget/resource";

export default function Memory({ expanded, refresh = 1500 }) {
  const { t } = useTranslation();

  const { data, error } = useSWR(`/api/widgets/resources?type=memory`, {
    refreshInterval: refresh,
  });

  if (error || data?.error) {
    return <Error />;
  }

  if (!data) {
    return (
      <Resource
        icon={FaMemory}
        value="-"
        label={t("resources.free")}
        expandedValue="-"
        expandedLabel={t("resources.total")}
        expanded={expanded}
        percentage="0"
      />
    );
  }

  const percent = Math.round((data.memory.active / data.memory.total) * 100);

  return (
    <Resource
      icon={FaMemory}
      value={t("common.bytes", { value: data.memory.available, maximumFractionDigits: 1, binary: true })}
      label={t("resources.free")}
      expandedValue={t("common.bytes", { value: data.memory.total, maximumFractionDigits: 1, binary: true })}
      expandedLabel={t("resources.total")}
      percentage={percent}
      expanded={expanded}
    />
  );
}
