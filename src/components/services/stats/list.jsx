import useSWR from "swr";
import { calculateCPUPercent, formatBytes } from "utils/stats-helpers";
import Stat from "./stat";

export default function Stats({ service }) {
  // fast
  const { data: statusData, error: statusError } = useSWR(
    `/api/docker/status/${service.container}/${service.server || ""}`,
    {
      refreshInterval: 1500,
    }
  );

  // takes a full second to collect stats
  const { data: statsData, error: statsError } = useSWR(
    `/api/docker/stats/${service.container}/${service.server || ""}`,
    {
      refreshInterval: 1500,
    }
  );

  // handle errors first
  if (statsError || statusError) {
    return (
      <div className="flex flex-row w-full">
        <Stat label="STATUS" value="Error Fetching Data" />
      </div>
    );
  }

  // handle the case where we get a docker error
  if (statusData.status !== "running") {
    return (
      <div className="flex flex-row w-full">
        <Stat label="STATUS" value="Error Fetching Data" />
      </div>
    );
  }

  // handle the case where the container is offline
  if (statusData.status !== "running") {
    return (
      <div className="flex flex-row w-full">
        <Stat label="STATUS" value="Offline" />
      </div>
    );
  }

  // handle the case where we don't have anything yet
  if (!statsData || !statusData) {
    return (
      <div className="flex flex-row w-full">
        <Stat label="CPU" value="-" />
        <Stat label="MEM" value="-" />
        <Stat label="RX" value="-" />
        <Stat label="TX" value="-" />
      </div>
    );
  }

  // we have stats and the container is running
  return (
    <div className="flex flex-row w-full">
      <Stat label="CPU" value={calculateCPUPercent(statsData.stats) + "%"} />
      <Stat label="MEM" value={formatBytes(statsData.stats.memory_stats.usage, 0)} />
      <Stat label="RX" value={formatBytes(statsData.stats.networks.eth0.rx_bytes, 0)} />
      <Stat label="TX" value={formatBytes(statsData.stats.networks.eth0.tx_bytes, 0)} />
    </div>
  );
}
