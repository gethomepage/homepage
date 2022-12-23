import { useTranslation } from "next-i18next";

import Container from "components/services/widget/container";
import Block from "components/services/widget/block";
import useWidgetAPI from "utils/proxy/use-widget-api";

export default function Component({ service }) {
  const { t } = useTranslation();

  const { widget } = service;

  const { data: statsData, error: statsError } = useWidgetAPI(widget, "system");
  const { data: leasesData, error: leasesError } = useWidgetAPI(widget, "leases");

  if (statsError || leasesError) {
    const finalError = statsError ?? leasesError;
    return <Container error={ finalError } />;
  }

  if (!statsData || !leasesData) {
    return (
      <Container service={service}>
        <Block label="mikrotik.uptime" />
        <Block label="mikrotik.cpuLoad" />
        <Block label="mikrotik.memoryUsed" />
        <Block label="mikrotik.numberOfLeases" />
      </Container>
    );
  }

  const memoryUsed = 100 - (statsData['free-memory'] / statsData['total-memory'])*100

  const numberOfLeases = leasesData.length

  return (
    <Container service={service}>
      <Block label="mikrotik.uptime" value={ statsData.uptime } />
      <Block label="mikrotik.cpuLoad" value={t("common.percent", { value: statsData['cpu-load'] })} />
      <Block label="mikrotik.memoryUsed" value={t("common.percent", { value: memoryUsed })} />
      <Block label="mikrotik.numberOfLeases" value={t("common.number", { value: numberOfLeases })} />
    </Container>
  );
}
