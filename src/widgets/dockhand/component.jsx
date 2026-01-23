import Block from "components/services/widget/block";
import Container from "components/services/widget/container";
import { useTranslation } from "next-i18next";

import useWidgetAPI from "utils/proxy/use-widget-api";

const MAX_FIELDS = 4;

export default function Component({ service }) {
  const { t } = useTranslation();
  const { widget } = service;

  if (!widget.fields) {
    widget.fields = ["running", "total", "cpu", "memory"];
  } else if (widget.fields.length > MAX_FIELDS) {
    widget.fields = widget.fields.slice(0, MAX_FIELDS);
  }

  const { data: stats, error: statsError } = useWidgetAPI(widget, "dashboard/stats");

  if (statsError) {
    return <Container service={service} error={statsError} />;
  }

  if (!stats) {
    return (
      <Container service={service}>
        <Block label="dockhand.running" />
        <Block label="dockhand.total" />
        <Block label="dockhand.stopped" />
        <Block label="dockhand.paused" />
        <Block label="dockhand.pending_updates" />
        <Block label="dockhand.cpu" />
        <Block label="dockhand.memory" />
        <Block label="dockhand.images" />
        <Block label="dockhand.volumes" />
        <Block label="dockhand.stacks" />
        <Block label="dockhand.events_today" />
      </Container>
    );
  }

  let running;
  let stopped;
  let paused;
  let totalContainers;
  let pendingUpdates;
  let cpuPercent;
  let memoryPercent;
  let imagesTotal;
  let volumesTotal;
  let stacksRunning;
  let stacksTotal;
  let eventsToday;

  if (widget?.environment) {
    const environment = stats.find(
      (env) =>
        env?.name?.toString().toLowerCase() === widget?.environment.toString().toLowerCase() ||
        env?.id?.toString() === widget?.environment.toString(),
    );
    if (environment) {
      running = environment?.containers?.running;
      stopped = environment?.containers?.stopped ?? (environment?.containers?.total ?? 0) - (running ?? 0);
      paused = environment?.containers?.paused;
      pendingUpdates = environment?.containers?.pendingUpdates;
      totalContainers = environment?.containers?.total;
      cpuPercent = environment?.metrics?.cpuPercent;
      memoryPercent = environment?.metrics?.memoryPercent;
      imagesTotal = environment?.images?.total;
      volumesTotal = environment?.volumes?.total;
      stacksRunning = environment?.stacks?.running;
      stacksTotal = environment?.stacks?.total;
      eventsToday = environment?.events?.today;
    } else {
      return (
        <Container service={service} error={t("dockhand.environment_not_found", { environment: widget.environment })} />
      );
    }
  }

  if (running === undefined) {
    // Aggregate across all environments
    running = stats.reduce((sum, env) => sum + (env?.containers?.running ?? 0), 0);
    totalContainers = stats.reduce((sum, env) => sum + (env?.containers?.total ?? 0), 0);
    stopped = totalContainers - running;
    paused = stats.reduce((sum, env) => sum + (env?.containers?.paused ?? 0), 0);
    pendingUpdates = stats.reduce((sum, env) => sum + (env?.containers?.pendingUpdates ?? 0), 0);
    const totalCpu = stats.reduce((sum, env) => sum + (env?.metrics?.cpuPercent ?? 0), 0);
    const totalMemory = stats.reduce((sum, env) => sum + (env?.metrics?.memoryPercent ?? 0), 0);
    const envCount = stats.length;
    cpuPercent = envCount > 0 ? totalCpu / envCount : 0;
    memoryPercent = envCount > 0 ? totalMemory / envCount : 0;
    imagesTotal = stats.reduce((sum, env) => sum + (env?.images?.total ?? 0), 0);
    volumesTotal = stats.reduce((sum, env) => sum + (env?.volumes?.total ?? 0), 0);
    stacksRunning = stats.reduce((sum, env) => sum + (env?.stacks?.running ?? 0), 0);
    stacksTotal = stats.reduce((sum, env) => sum + (env?.stacks?.total ?? 0), 0);
    eventsToday = stats.reduce((sum, env) => sum + (env?.events?.today ?? 0), 0);
  }

  return (
    <Container service={service}>
      <Block label="dockhand.running" value={t("common.number", { value: running })} />
      <Block label="dockhand.stopped" value={t("common.number", { value: stopped })} />
      <Block label="dockhand.paused" value={t("common.number", { value: paused ?? 0 })} />
      <Block label="dockhand.pending_updates" value={t("common.number", { value: pendingUpdates ?? 0 })} />
      <Block label="dockhand.total" value={t("common.number", { value: totalContainers })} />
      <Block label="dockhand.cpu" value={t("common.percent", { value: cpuPercent, maximumFractionDigits: 1 })} />
      <Block label="dockhand.memory" value={t("common.percent", { value: memoryPercent, maximumFractionDigits: 1 })} />
      <Block label="dockhand.images" value={t("common.number", { value: imagesTotal ?? 0 })} />
      <Block label="dockhand.volumes" value={t("common.number", { value: volumesTotal ?? 0 })} />
      <Block
        label="dockhand.stacks"
        value={
          stacksRunning != null && stacksTotal != null
            ? `${stacksRunning} / ${stacksTotal}`
            : t("common.number", { value: stacksRunning ?? stacksTotal ?? 0 })
        }
      />
      <Block label="dockhand.events_today" value={t("common.number", { value: eventsToday ?? 0 })} />
    </Container>
  );
}
