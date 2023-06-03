import useSWR from "swr";
import { FaRegClock } from "react-icons/fa";
import { useTranslation } from "next-i18next";

import SingleResource from "../widget/single_resource";
import WidgetIcon from "../widget/widget_icon";
import ResourceValue from "../widget/resource_value";
import ResourceLabel from "../widget/resource_label";
import Error from "../widget/error";

import UsageBar from "./usage-bar";

export default function Uptime() {
  const { t } = useTranslation();

  const { data, error } = useSWR(`/api/widgets/resources?type=uptime`, {
    refreshInterval: 1500,
  });

  if (error || data?.error) {
    return <Error />
  }

  if (!data) {
    return <SingleResource>
      <WidgetIcon icon={FaRegClock} />
      <ResourceValue>-</ResourceValue>
      <ResourceLabel>{t("resources.uptime")}</ResourceLabel>
    </SingleResource>;
  }

  const mo = Math.floor(data.uptime / (3600 * 24 * 31));
  const d = Math.floor(data.uptime % (3600 * 24 * 31) / (3600 * 24));
  const h = Math.floor(data.uptime % (3600 * 24) / 3600);
  const m = Math.floor(data.uptime % 3600 / 60);

  let uptime;
  if (mo > 0) uptime = `${mo}${t("resources.months")} ${d}${t("resources.days")}`;
  else if (d > 0) uptime = `${d}${t("resources.days")} ${h}${t("resources.hours")}`;
  else uptime = `${h}${t("resources.hours")} ${m}${t("resources.minutes")}`;

  const percent = Math.round((new Date().getSeconds() / 60) * 100);

  return <SingleResource>
    <WidgetIcon icon={FaRegClock} />
    <ResourceValue>{uptime}</ResourceValue>
    <ResourceLabel>{t("resources.uptime")}</ResourceLabel>
    <UsageBar percent={percent} />
  </SingleResource>;
}
