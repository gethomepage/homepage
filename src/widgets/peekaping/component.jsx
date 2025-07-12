import Block from "components/services/widget/block";
import Container from "components/services/widget/container";
import { useTranslation } from "next-i18next";

import useWidgetAPI from "utils/proxy/use-widget-api";

export default function Component({ service }) {
  const { t } = useTranslation();
  const { widget } = service;

  const { data: monitorsResponse, error: monitorsError } = useWidgetAPI(widget, "monitors");

  if (monitorsError) {
    return <Container service={service} error={monitorsError} />;
  }

  if (!monitorsResponse) {
    return (
      <Container service={service}>
        <Block label="peekaping.up" />
        <Block label="peekaping.down" />
        <Block label="peekaping.uptime" />
        <Block label="peekaping.avgResponse" />
      </Container>
    );
  }

  const monitors = monitorsResponse.data || [];

  // Calculate statistics from monitors array
  let upMonitors = 0;
  let downMonitors = 0;
  let totalUptime = 0;
  let totalResponseTime = 0;
  let responseTimeCount = 0;

  monitors.forEach((monitor) => {
    if (monitor.active && monitor.heartbeats && monitor.heartbeats.length > 0) {
      // Get the latest heartbeat status
      const latestHeartbeat = monitor.heartbeats[monitor.heartbeats.length - 1];
      if (latestHeartbeat.status === 1) {
        upMonitors++;
      } else {
        downMonitors++;
      }

      // Add to uptime calculation
      totalUptime += monitor.uptime_24h || 0;

      // Calculate response times from heartbeats
      monitor.heartbeats.forEach((heartbeat) => {
        totalResponseTime += heartbeat.ping || 0
        responseTimeCount ++
      });
    }
  });

  // Calculate averages
  const uptimePercent = monitors.length > 0 ? totalUptime / monitors.length : 0;
  const avgResponseTime = responseTimeCount > 0 ? totalResponseTime / responseTimeCount : 0;

  // Format uptime percentage
  const uptimeFormatted =
    uptimePercent != null ? t("common.percent", { value: uptimePercent.toFixed(1) }) : t("peekaping.unknown");

  // Format average response time
  const avgResponseFormatted =
    avgResponseTime > 0 ? t("common.ms", { value: Math.round(avgResponseTime) }) : t("peekaping.unknown");

  return (
    <Container service={service}>
      <Block label="peekaping.up" value={t("common.number", { value: upMonitors })} />
      <Block label="peekaping.down" value={t("common.number", { value: downMonitors })} />
      <Block label="peekaping.uptime" value={uptimeFormatted} />
      <Block label="peekaping.avgResponse" value={avgResponseFormatted} />
    </Container>
  );
}
