import useSWR from "swr";

import Widget from "../widget";
import Block from "../block";

import { formatBits } from "utils/stats-helpers";
import { formatApiUrl } from "utils/api-helpers";

export default function Speedtest({ service }) {
  const config = service.widget;

  const { data: speedtestData, error: speedtestError } = useSWR(formatApiUrl(config, "speedtest/latest"));

  if (speedtestError) {
    return <Widget error="Speedtest API Error" />;
  }

  if (!speedtestData) {
    return (
      <Widget>
        <Block label="Download" />
        <Block label="Upload" />
        <Block label="Ping" />
      </Widget>
    );
  }

  return (
    <Widget>
      <Block label="Download" value={`${formatBits(speedtestData.data.download * 1024 * 1024, 0)}ps`} />
      <Block label="Upload" value={`${formatBits(speedtestData.data.upload * 1024 * 1024, 0)}ps`} />
      <Block label="Ping" value={`${speedtestData.data.ping} ms`} />
    </Widget>
  );
}
