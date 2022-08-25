import useSWR from "swr";

import { calculateCPUPercent, formatBytes } from "utils/stats-helpers";

import Widget from "../widget";
import Block from "../block";

export default function Docker({ service }) {
  const config = service.widget;

  const { data: statusData, error: statusError } = useSWR(
    `/api/docker/status/${config.container}/${config.server || ""}`,
    {
      refreshInterval: 1500,
    }
  );

  const { data: statsData, error: statsError } = useSWR(
    `/api/docker/stats/${config.container}/${config.server || ""}`,
    {
      refreshInterval: 1500,
    }
  );

  if (statsError || statusError) {
    return <Widget error="Error Fetching Data" />;
  }

  if (statusData && statusData.status !== "running") {
    return (
      <Widget>
        <Block label="Status" value="Offline" />
      </Widget>
    );
  }

  if (!statsData || !statusData) {
    return (
      <Widget>
        <Block label="CPU" />
        <Block label="MEM" />
        <Block label="RX" />
        <Block label="TX" />
      </Widget>
    );
  }

  return (
    <Widget>
      <Block label="CPU" value={`${calculateCPUPercent(statsData.stats)}%`} />
      <Block label="MEM" value={formatBytes(statsData.stats.memory_stats.usage, 0)} />
      <Block label="RX" value={formatBytes(statsData.stats.networks.eth0.rx_bytes, 0)} />
      <Block label="TX" value={formatBytes(statsData.stats.networks.eth0.tx_bytes, 0)} />
    </Widget>
  );
}
