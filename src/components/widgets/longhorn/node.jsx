import { useTranslation } from "next-i18next";
import { FiHardDrive } from "react-icons/fi";

import Resource from "../widget/resource";
import WidgetLabel from "../widget/widget_label";

export default function Node({ data, expanded, labels }) {
  const { t } = useTranslation();

  return (
    <Resource
      additionalClassNames="information-widget-longhorn-node"
      icon={FiHardDrive}
      value={t("common.bytes", { value: data.node.available })}
      label={t("resources.free")}
      expandedValue={t("common.bytes", { value: data.node.maximum })}
      expandedLabel={t("resources.total")}
      percentage={Math.round(((data.node.maximum - data.node.available) / data.node.maximum) * 100)}
      expanded={expanded}
    >
      {labels && <WidgetLabel label={data.node.id} />}
    </Resource>
  );
}
