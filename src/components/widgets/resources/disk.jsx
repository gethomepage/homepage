import useSWR from "swr";
import { FiHardDrive } from "react-icons/fi";
import { useTranslation } from "next-i18next";

import SingleResource from "../widget/single_resource";
import WidgetIcon from "../widget/widget_icon";
import ResourceValue from "../widget/resource_value";
import ResourceLabel from "../widget/resource_label";
import Error from "../widget/error";

import UsageBar from "./usage-bar";

export default function Disk({ options, expanded }) {
  const { t } = useTranslation();

  const { data, error } = useSWR(`/api/widgets/resources?type=disk&target=${options.disk}`, {
    refreshInterval: 1500,
  });

  if (error || data?.error) {
    return <Error options={options} />
  }

  if (!data) {
    return <SingleResource expanded={expanded}>
      <WidgetIcon icon={FiHardDrive} />
      <ResourceValue>-</ResourceValue>
      <ResourceLabel>{t("resources.free")}</ResourceLabel>
      <ResourceValue>-</ResourceValue>
      <ResourceLabel>{t("resources.total")}</ResourceLabel>
      <UsageBar percent={0} />
    </SingleResource>;
  }

  // data.drive.used not accurate?
  const percent = Math.round(((data.drive.size - data.drive.available) / data.drive.size) * 100);

  return <SingleResource expanded={expanded}>
    <WidgetIcon icon={FiHardDrive} />
    <ResourceValue>{t("common.bytes", { value: data.drive.available })}</ResourceValue>
    <ResourceLabel>{t("resources.free")}</ResourceLabel>
    <ResourceValue>{t("common.bytes", { value: data.drive.size })}</ResourceValue>
    <ResourceLabel>{t("resources.total")}</ResourceLabel>
    <UsageBar percent={percent} />
  </SingleResource>;
}
