import { useTranslation } from "next-i18next";
import { FaThermometerHalf } from "react-icons/fa";

import UsageBar from "../resources/usage-bar";
import SingleResource from "../widget/single_resource";
import WidgetIcon from "../widget/widget_icon";
import ResourceValue from "../widget/resource_value";
import ResourceLabel from "../widget/resource_label";
import WidgetLabel from "../widget/widget_label";

export default function Node({ data, expanded, labels }) {
  const { t } = useTranslation();

  return <SingleResource expanded={expanded}>
    <WidgetIcon icon={FaThermometerHalf} />
    <ResourceValue>{t("common.bytes", { value: data.node.available })}</ResourceValue>
    <ResourceLabel>{t("resources.free")}</ResourceLabel>
    <ResourceValue>{t("common.bytes", { value: data.node.maximum })}</ResourceValue>
    <ResourceLabel>{t("resources.total")}</ResourceLabel>
    <UsageBar percent={Math.round(((data.node.maximum - data.node.available) / data.node.maximum) * 100)} />
    { labels && <WidgetLabel label={data.node.id} /> }
  </SingleResource>
}
