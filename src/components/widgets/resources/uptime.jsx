import { useTranslation } from "next-i18next";
import { FaRegClock } from "react-icons/fa";
import useSWR from "swr";

import Error from "../widget/error";
import Resource from "../widget/resource";

export default function Uptime({ refresh = 1500 }) {
  const { t } = useTranslation();

  const { data, error } = useSWR(`/api/widgets/resources?type=uptime`, {
    refreshInterval: refresh,
  });

  if (error || data?.error) {
    return <Error />;
  }

  if (!data) {
    return <Resource icon={FaRegClock} value="-" label={t("resources.uptime")} percentage="0" />;
  }

  const percent = Math.round((new Date().getSeconds() / 60) * 100).toString();

  return (
    <Resource
      icon={FaRegClock}
      value={t("common.duration", { value: data.uptime })}
      label={t("resources.uptime")}
      percentage={percent}
    />
  );
}
