import useSWR from "swr";

import Widget from "../widget";
import Block from "../block";

import { formatApiUrl } from "utils/api-helpers";

export default function Tautulli({ service }) {
  const config = service.widget;

  const { data: statsData, error: statsError } = useSWR(formatApiUrl(config, "get_activity"));

  if (statsError) {
    return <Widget error="Tautulli API Error" />;
  }

  if (!statsData) {
    return (
      <Widget>
        <Block label="Playing" />
        <Block label="Transcoding" />
        <Block label="Bitrate" />
      </Widget>
    );
  }

  const data = statsData.response.data;

  return (
    <Widget>
      <Block label="Playing" value={data.stream_count} />
      <Block label="Transcoding" value={data.stream_count_transcode} />
      {/* We divide by 1000 here because thats how Tautulli reports it on its own dashboard */}
      <Block label="Bitrate" value={`${Math.round((data.total_bandwidth / 1000) * 100) / 100} Mbps`} />
    </Widget>
  );
}
