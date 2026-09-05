import { useTranslation } from "next-i18next/pages";
import useSWR from "swr";

import Block from "components/services/widget/block";
import Container from "components/services/widget/container";

export default function Component({ service }) {
  const { t } = useTranslation();

  const { widget } = service;
  const server = encodeURIComponent(widget.server || "");

  const { data: statusResponse, error: statusError } = useSWR(`/api/docker/statuses?server=${server}`);
  const { statuses } = statusResponse ?? {};
  const statusData = statuses ? (statuses[widget.container] ?? { status: "not found" }) : undefined;

  const { data: statsResponse, error: statsError } = useSWR(`/api/docker/stats?server=${server}`);
  const { stats } = statsResponse ?? {};
  const statsData = stats?.[widget.container];

  if (statsError || statsResponse?.error || statsData?.error || statusError || statusResponse?.error) {
    const finalError = statsError ?? statsResponse?.error ?? statsData?.error ?? statusError ?? statusResponse?.error;
    return <Container service={service} error={finalError} />;
  }

  if (statusData && !(statusData.status.includes("running") || statusData.status.includes("partial"))) {
    return (
      <Container>
        <Block label={t("widget.status")} value={t("docker.offline")} />
      </Container>
    );
  }

  // running, but reporting no stats: a swarm service whose container is on another node
  if (statusData && stats && !statsData) {
    return <Container service={service} error="not found" />;
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

  const { cpu, mem, rx, tx } = statsData;

  return (
    <Container service={service}>
      <Block label="docker.cpu" value={t("common.percent", { value: cpu })} highlightValue={cpu} />
      {mem !== undefined && <Block label="docker.mem" value={t("common.bytes", { value: mem })} highlightValue={mem} />}
      {rx !== undefined && (
        <>
          <Block label="docker.rx" value={t("common.bytes", { value: rx })} highlightValue={rx} />
          <Block label="docker.tx" value={t("common.bytes", { value: tx })} highlightValue={tx} />
        </>
      )}
    </Container>
  );
}
