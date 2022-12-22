import { useTranslation } from "next-i18next";

import Container from "components/services/widget/container";
import Block from "components/services/widget/block";
import useWidgetAPI from "utils/proxy/use-widget-api";

export default function Component({ service }) {
  const { t } = useTranslation();

  const { widget } = service;

  const { data: statsData, error: statsError } = useWidgetAPI(widget, "system");

  if (statsError) {
    return <Container error={statsError} />;
  }

  if (!statsData) {
    return (
      <Container service={service}>
        <Block label="mikrotik.uptime" />
        <Block label="mikrotik.cpuload" />
        <Block label="mikrotik.memoryused" />

      </Container>
    );
  }

  const memoryused = 100 - (statsData['free-memory'] / statsData['total-memory'])*100

  return (
    <Container service={service}>
      <Block label="mikrotik.uptime" value={ statsData.uptime } />
      <Block label="mikrotik.cpuload" value={t("common.number", { value: statsData['cpu-load'] })} />
      <Block label="mikrotik.memoryused" value={t("common.percent", { value: memoryused })} />
    </Container>
  );
}
