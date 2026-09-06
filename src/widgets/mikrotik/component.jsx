import { useTranslation } from "next-i18next/pages";

import Block from "components/services/widget/block";
import Container from "components/services/widget/container";
import useWidgetAPI from "utils/proxy/use-widget-api";

export default function Component({ service }) {
  const { t } = useTranslation();

  const { widget } = service;

  const { data: statsData, error: statsError } = useWidgetAPI(widget, "system");
  const { data: leasesData, error: leasesError } = useWidgetAPI(widget, "leases");
  const { data: healthData, error: healthError } = useWidgetAPI(widget, "health");

  if (statsError || leasesError || healthError) {
    const finalError = statsError ?? leasesError ?? healthError;
    return <Container service={service} error={finalError} />;
  }

  if (!statsData || !leasesData || !healthData) {
    return (
      <Container service={service}>
        <Block label="mikrotik.uptime" />
        <Block label="mikrotik.cpuLoad" />
        <Block label="mikrotik.memoryUsed" />
        <Block label="mikrotik.numberOfLeases" />
        <Block label="mikrotik.cpuTemperature" />
        <Block label="mikrotik.sfpTemperature" />
        <Block label="mikrotik.version" />
      </Container>
    );
  }

  const memoryUsed = 100 - (statsData["free-memory"] / statsData["total-memory"]) * 100;

  const numberOfLeases = leasesData.length;
  const routerOsVersion = statsData.version?.split(" ")[0];
  const cpuTemperatureItem = healthData?.find((item) => item.name === "cpu-temperature");
  const sfpTemperatureItem = healthData?.find((item) => item.name === "sfp-temperature");
  const cpuTemperature = cpuTemperatureItem ? `${cpuTemperatureItem.value}°${cpuTemperatureItem.type}` : undefined;
  const sfpTemperature = sfpTemperatureItem ? `${sfpTemperatureItem.value}°${sfpTemperatureItem.type}` : undefined;

  return (
    <Container service={service}>
      <Block label="mikrotik.uptime" value={statsData.uptime} />
      <Block
        label="mikrotik.cpuLoad"
        value={t("common.percent", { value: statsData["cpu-load"] })}
        highlightValue={statsData["cpu-load"]}
      />
      <Block
        label="mikrotik.memoryUsed"
        value={t("common.percent", { value: memoryUsed })}
        highlightValue={memoryUsed}
      />
      <Block label="mikrotik.numberOfLeases" value={t("common.number", { value: numberOfLeases })} />
      {cpuTemperature && <Block label="mikrotik.cpuTemperature" value={cpuTemperature} />}
      {sfpTemperature && <Block label="mikrotik.sfpTemperature" value={sfpTemperature} />}
      <Block label="mikrotik.version" value={routerOsVersion} />
    </Container>
  );
}
