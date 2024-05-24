import useSWR from "swr";
import { useTranslation } from "next-i18next";

import Container from "components/services/widget/container";
import Block from "components/services/widget/block";

export default function Component({ service }) {
  const { t } = useTranslation();

  const { widget } = service;
  const podSelectorString = widget.podSelector !== undefined ? `podSelector=${widget.podSelector}` : "";
  const { data: statusData, error: statusError } = useSWR(
    `/api/kubernetes/status/${widget.namespace}/${widget.app}?${podSelectorString}`,
  );

  const { data: statsData, error: statsError } = useSWR(
    `/api/kubernetes/stats/${widget.namespace}/${widget.app}?${podSelectorString}`,
  );

  if (statsError || statusError) {
    return <Container service={service} error={statsError ?? statusError ?? statusData} />;
  }

  if (
    statusData &&
    (!statusData.status || !(statusData.status.includes("running") || statusData.status.includes("partial")))
  ) {
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
      </Container>
    );
  }

  return (
    <Container service={service}>
      {(statsData.stats.cpuLimit && (
        <Block label="docker.cpu" value={t("common.percent", { value: statsData.stats.cpuUsage })} />
      )) || (
        <Block
          label="docker.cpu"
          value={t("common.number", { value: statsData.stats.cpu, maximumFractionDigits: 4 })}
        />
      )}
      <Block label="docker.mem" value={t("common.bytes", { value: statsData.stats.mem })} />
    </Container>
  );
}
