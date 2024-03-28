import useSWR from "swr";
import { FaRegClock } from "react-icons/fa";
import { useTranslation } from "next-i18next";

import Resource from "../widget/resource";
import Error from "../widget/error";

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
      value={t("common.uptime", { value: data.uptime })}
      label={t("resources.uptime")}
      percentage={percent}
    />
  );
}
