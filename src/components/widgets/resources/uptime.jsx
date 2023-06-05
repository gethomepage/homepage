import useSWR from "swr";
import { FaRegClock } from "react-icons/fa";
import { useTranslation } from "next-i18next";

import Resource from "../widget/resource";
import Error from "../widget/error";

export default function Uptime() {
  const { t } = useTranslation();

  const { data, error } = useSWR(`/api/widgets/resources?type=uptime`, {
    refreshInterval: 1500,
  });

  if (error || data?.error) {
    return <Error />
  }

  if (!data) {
    return <Resource icon={FaRegClock} value="-" label={t("resources.uptime")} percentage="0" />;
  }

  const mo = Math.floor(data.uptime / (3600 * 24 * 31));
  const d = Math.floor(data.uptime % (3600 * 24 * 31) / (3600 * 24));
  const h = Math.floor(data.uptime % (3600 * 24) / 3600);
  const m = Math.floor(data.uptime % 3600 / 60);

  let uptime;
  if (mo > 0) uptime = `${mo}${t("resources.months")} ${d}${t("resources.days")}`;
  else if (d > 0) uptime = `${d}${t("resources.days")} ${h}${t("resources.hours")}`;
  else uptime = `${h}${t("resources.hours")} ${m}${t("resources.minutes")}`;

  const percent = Math.round((new Date().getSeconds() / 60) * 100).toString();

  return <Resource icon={FaRegClock} value={uptime} label={t("resources.uptime")} percentage={percent} />;
}
