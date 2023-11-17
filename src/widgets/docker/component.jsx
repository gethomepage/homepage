import useSWR from "swr";
import { useTranslation } from "next-i18next";

import { calculateCPUPercent, calculateUsedMemory, calculateThroughput } from "./stats-helpers";

import Container from "components/services/widget/container";
import Block from "components/services/widget/block";

export default function Component({ service }) {
  const { t } = useTranslation();

  const { widget } = service;

  const { data: statusData, error: statusError } = useSWR(
    `/api/docker/status/${widget.container}/${widget.server || ""}`,
  );

  const { data: statsData, error: statsError } = useSWR(`/api/docker/stats/${widget.container}/${widget.server || ""}`);

  if (statsError || statsData?.error || statusError || statusData?.error) {
    const finalError = statsError ?? statsData?.error ?? statusError ?? statusData?.error;
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

  return (
    <Container service={service}>
      <Block label="docker.cpu" value={t("common.percent", { value: calculateCPUPercent(statsData.stats) })} />
      {statsData.stats.memory_stats.usage && (
        <Block label="docker.mem" value={t("common.bytes", { value: calculateUsedMemory(statsData.stats) })} />
      )}
      {statsData.stats.networks && (
        <>
          <Block label="docker.rx" value={t("common.bytes", { value: rxBytes })} />
          <Block label="docker.tx" value={t("common.bytes", { value: txBytes })} />
        </>
      )}
    </Container>
  );
}
