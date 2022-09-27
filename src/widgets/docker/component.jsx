import useSWR from "swr";
import { useTranslation } from "next-i18next";

import calculateCPUPercent from "./stats-helpers";

import Container from "components/services/widget/container";
import Block from "components/services/widget/block";

export default function Component({ service }) {
  const { t } = useTranslation();

  const { widget } = service;

  const { data: statusData, error: statusError } = useSWR(
    `/api/docker/status/${widget.container}/${widget.server || ""}`
  );

  const { data: statsData, error: statsError } = useSWR(`/api/docker/stats/${widget.container}/${widget.server || ""}`);

  if (statsError || statusError) {
    return <Container error={t("widget.api_error")} />;
  }

  if (statusData && statusData.status !== "running") {
    return (
      <Container>
        <Block label={t("widget.status")} value={t("docker.offline")} />
      </Container>
    );
  }

  if (!statsData || !statusData) {
    return (
      <Container>
        <Block label={t("docker.cpu")} />
        <Block label={t("docker.mem")} />
        <Block label={t("docker.rx")} />
        <Block label={t("docker.tx")} />
      </Container>
    );
  }

  return (
    <Container>
      <Block label={t("docker.cpu")} value={t("common.percent", { value: calculateCPUPercent(statsData.stats) })} />
      <Block label={t("docker.mem")} value={t("common.bytes", { value: statsData.stats.memory_stats.usage })} />
      {statsData.stats.networks && (
        <>
          <Block label={t("docker.rx")} value={t("common.bytes", { value: statsData.stats.networks.eth0.rx_bytes })} />
          <Block label={t("docker.tx")} value={t("common.bytes", { value: statsData.stats.networks.eth0.tx_bytes })} />
        </>
      )}
    </Container>
  );
}
