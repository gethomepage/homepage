import useSWR from "swr";
import { useTranslation } from "next-i18next";

import Container from "components/services/widget/container";
import Block from "components/services/widget/block";

export default function Component({ service }) {
  const { t } = useTranslation();

  const { widget } = service;

  const { data: statusData, error: statusError } = useSWR(
    `/api/kubernetes/status/${widget.namespace}/${widget.app}`);

  const { data: statsData, error: statsError } = useSWR(
    `/api/kubernetes/stats/${widget.namespace}/${widget.app}`);

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
      <Container service={service}>
        <Block label="docker.cpu" />
        <Block label="docker.mem" />
        <Block label="docker.rx" />
        <Block label="docker.tx" />
      </Container>
    );
  }

  const network = statsData.stats?.networks?.eth0 || statsData.stats?.networks?.network;
  return (
    <Container service={service}>
      <Block label="docker.cpu" value={t("common.percent", { value: statsData.stats.cpuUsage })} />
      <Block label="docker.mem" value={t("common.bytes", { value: statsData.stats.mem })} />
      {network && (
        <>
          <Block label="docker.rx" value={t("common.bytes", { value: network.rx_bytes })} />
          <Block label="docker.tx" value={t("common.bytes", { value: network.tx_bytes })} />
        </>
      )}
    </Container>
  );
}
