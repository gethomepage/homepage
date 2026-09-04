import { useTranslation } from "next-i18next/pages";
import useSWR from "swr";

import { calculateCPUPercent, calculateThroughput, calculateUsedMemory } from "./stats-helpers";

import Block from "components/services/widget/block";
import Container from "components/services/widget/container";

export default function Component({ service }) {
  const { t } = useTranslation();

  const { widget } = service;

  const { data: statusResponse, error: statusError } = useSWR(
    `/api/docker/statuses?server=${encodeURIComponent(widget.server || "")}`,
  );
  const { statuses } = statusResponse ?? {};
  const statusData = statuses ? (statuses[widget.container] ?? { status: "not found" }) : undefined;

  const { data: statsData, error: statsError } = useSWR(`/api/docker/stats/${widget.container}/${widget.server || ""}`);

  if (statsError || statsData?.error || statusError || statusResponse?.error) {
    const finalError = statsError ?? statsData?.error ?? statusError ?? statusResponse?.error;
    return <Container service={service} error={finalError} />;
  }

  if (statusData && !(statusData.status.includes("running") || statusData.status.includes("partial"))) {
    return (
      <Container>
        <Block label={t("widget.status")} value={t("docker.offline")} />
      </Container>
    );
  }

  if (!statsData || !statusData) {
    return (
      <Container service={service}>
        <Block label="docker.cpu" />
        <Block label="docker.mem" />
        <Block label="docker.rx" />
        <Block label="docker.tx" />
      </Container>
    );
  }

  const { rxBytes, txBytes } = calculateThroughput(statsData.stats);
  const cpuPercent = calculateCPUPercent(statsData.stats);
  const usedMemory = calculateUsedMemory(statsData.stats);

  return (
    <Container service={service}>
      <Block label="docker.cpu" value={t("common.percent", { value: cpuPercent })} highlightValue={cpuPercent} />
      {statsData.stats.memory_stats.usage && (
        <Block label="docker.mem" value={t("common.bytes", { value: usedMemory })} highlightValue={usedMemory} />
      )}
      {statsData.stats.networks && (
        <>
          <Block label="docker.rx" value={t("common.bytes", { value: rxBytes })} highlightValue={rxBytes} />
          <Block label="docker.tx" value={t("common.bytes", { value: txBytes })} highlightValue={txBytes} />
        </>
      )}
    </Container>
  );
}
