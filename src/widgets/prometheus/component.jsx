import { useTranslation } from "next-i18next";

import Container from "components/services/widget/container";
import Block from "components/services/widget/block";
import useWidgetAPI from "utils/proxy/use-widget-api";

export default function Component({ service }) {
  const { t } = useTranslation();

  const { widget } = service;
  const { data: targetsData, error: targetsError } = useWidgetAPI(widget, "targets");

  if (targetsError) {
    return <Container error={targetsError} />;
  }

  if (!targetsData) {
    return (
      <Container service={service}>
        <Block label="prometheus.targets_up" />
        <Block label="prometheus.targets_down" />
        <Block label="prometheus.targets_total" />
      </Container>
    );
  }

  const upCount = targetsData.data.activeTargets.filter(a => a.health === "up").length;
  const downCount = targetsData.data.activeTargets.filter(a => a.health === "down").length;
  const totalCount = targetsData.data.activeTargets.length;

  return (
    <Container service={service}>
      <Block label="prometheus.targets_up" value={t("common.number", { value: upCount })} />
      <Block label="prometheus.targets_down" value={t("common.number", { value: downCount })} />
      <Block label="prometheus.targets_total" value={t("common.number", { value: totalCount })} />
    </Container>
  );
}
