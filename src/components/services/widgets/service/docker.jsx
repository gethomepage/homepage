import useSWR from "swr";
import { useTranslation } from "react-i18next";

import Widget from "../widget";
import Block from "../block";

import { calculateCPUPercent } from "utils/stats-helpers";

export default function Docker({ service }) {
  const { t } = useTranslation();

  const config = service.widget;

  const { data: statusData, error: statusError } = useSWR(
    `/api/docker/status/${config.container}/${config.server || ""}`,
    {
      refreshInterval: 5000,
    }
  );

  const { data: statsData, error: statsError } = useSWR(
    `/api/docker/stats/${config.container}/${config.server || ""}`,
    {
      refreshInterval: 5000,
    }
  );

  if (statsError || statusError) {
    return <Widget error={t("docker.api_error")} />;
  }

  if (statusData && statusData.status !== "running") {
    return (
      <Widget>
        <Block label={t("widget.status")} value={t("docker.offline")} />
      </Widget>
    );
  }

  if (!statsData || !statusData) {
    return (
      <Widget>
        <Block label={t("docker.cpu")} />
        <Block label={t("docker.mem")} />
        <Block label={t("docker.rx")} />
        <Block label={t("docker.tx")} />
      </Widget>
    );
  }

  return (
    <Widget>
      <Block label={t("docker.cpu")} value={t("common.percent", { value: calculateCPUPercent(statsData.stats) })} />
      <Block label={t("docker.mem")} value={t("common.bytes", { value: statsData.stats.memory_stats.usage })} />
      {statsData.stats.networks && (
        <>
          <Block label={t("docker.rx")} value={t("common.bytes", { value: statsData.stats.networks.eth0.rx_bytes })} />
          <Block label={t("docker.tx")} value={t("common.bytes", { value: statsData.stats.networks.eth0.tx_bytes })} />
        </>
      )}
    </Widget>
  );
}
