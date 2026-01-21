import Block from "components/services/widget/block";
import Container from "components/services/widget/container";
import { useTranslation } from "next-i18next";

import useWidgetAPI from "utils/proxy/use-widget-api";

export default function Component({ service }) {
  const { t } = useTranslation();
  const { widget } = service;

  const { data, error } = useWidgetAPI(widget);

  if (error) {
    return <Container service={service} error={error} />;
  }

  if (!data) {
    return (
      <Container service={service}>
        <Block label="dockhand.containersTotal" />
        <Block label="dockhand.containersRunning" />
        <Block label="dockhand.containersStopped" />
        <Block label="dockhand.containersPaused" />
        <Block label="dockhand.containersRestarting" />
        <Block label="dockhand.containersUnhealthy" />
        <Block label="dockhand.containersPendingUpdates" />
        <Block label="dockhand.metricsCpuPercent" />
        <Block label="dockhand.metricsMemoryPercent" />
        <Block label="dockhand.metricsMemoryUsed" />
        <Block label="dockhand.metricsMemoryTotal" />
      </Container>
    );
  }

  return (
    <>
      <Container service={service}>
        <Block label="dockhand.containersTotal" value={data.containers.total} />
        <Block label="dockhand.containersRunning" value={data.containers.running} />
        <Block label="dockhand.containersStopped" value={data.containers.stopped} />
        <Block label="dockhand.containersPaused" value={data.containers.paused} />
        <Block label="dockhand.containersRestarting" value={data.containers.restarting} />
        <Block label="dockhand.containersUnhealthy" value={data.containers.unhealthy} />
        <Block label="dockhand.containersPendingUpdates" value={data.containers.pendingUpdates} />
        <Block label="dockhand.metricsCpuPercent" value={t("common.percent", { value: data.metrics.cpuPercent })} />
        <Block label="dockhand.metricsMemoryPercent" value={t("common.percent", { value: data.metrics.memoryPercent })} />
        <Block label="dockhand.metricsMemoryUsed" value={t("common.bytes", { value: data.metrics.memoryUsed })} />
        <Block label="dockhand.metricsMemoryTotal" value={t("common.bytes", { value: data.metrics.memoryTotal })} />
      </Container>
    </>
  );
}
