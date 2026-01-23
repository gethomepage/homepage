import Block from "components/services/widget/block";
import Container from "components/services/widget/container";
import { useTranslation } from "next-i18next";

import useWidgetAPI from "utils/proxy/use-widget-api";

export default function Component({ service }) {
  const { t } = useTranslation();
  const { widget } = service;

  const { data: stats, error: statsError } = useWidgetAPI(widget, "dashboard/stats");

  if (statsError) {
    return <Container service={service} error={statsError} />;
  }

  if (!stats) {
    return (
      <Container service={service}>
        <Block label="dockhand.running" />
        <Block label="dockhand.stopped" />
        <Block label="dockhand.cpu" />
        <Block label="dockhand.memory" />
      </Container>
    );
  }

  let running;
  let stopped;
  let cpuPercent;
  let memoryPercent;

  if (widget?.environment) {
    // Filter by environment if set
    const environment = stats.find((env) => env.name === widget.environment);
    if (environment) {
      running = environment?.containers?.running;
      stopped = environment?.containers?.stopped ?? (environment?.containers?.total ?? 0) - (running ?? 0);
      cpuPercent = environment?.metrics?.cpuPercent;
      memoryPercent = environment?.metrics?.memoryPercent;
    }
  } else {
    // Aggregate across all environments
    running = stats.reduce((sum, env) => sum + (env?.containers?.running ?? 0), 0);
    const total = stats.reduce((sum, env) => sum + (env?.containers?.total ?? 0), 0);
    stopped = total - running;
    const totalCpu = stats.reduce((sum, env) => sum + (env?.metrics?.cpuPercent ?? 0), 0);
    const totalMemory = stats.reduce((sum, env) => sum + (env?.metrics?.memoryPercent ?? 0), 0);
    const envCount = stats.length;
    cpuPercent = envCount > 0 ? totalCpu / envCount : 0;
    memoryPercent = envCount > 0 ? totalMemory / envCount : 0;
  }

  return (
    <Container service={service}>
      <Block label="dockhand.running" value={t("common.number", { value: running })} />
      <Block label="dockhand.stopped" value={t("common.number", { value: stopped })} />
      <Block label="dockhand.cpu" value={t("common.percent", { value: cpuPercent, maximumFractionDigits: 1 })} />
      <Block label="dockhand.memory" value={t("common.percent", { value: memoryPercent, maximumFractionDigits: 1 })} />
    </Container>
  );
}
