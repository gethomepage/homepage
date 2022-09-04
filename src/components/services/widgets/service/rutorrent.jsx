import useSWR from "swr";

import Widget from "../widget";
import Block from "../block";

import { formatApiUrl } from "utils/api-helpers";
import { formatBytes } from "utils/stats-helpers";

export default function Rutorrent({ service }) {
  const config = service.widget;

  const { data: statusData, error: statusError } = useSWR(formatApiUrl(config));

  if (statusError) {
    return <Widget error="Nzbget API Error" />;
  }

  if (!statusData) {
    return (
      <Widget>
        <Block label="Active" />
        <Block label="Upload" />
        <Block label="Download" />
      </Widget>
    );
  }

  const upload = statusData.reduce((acc, torrent) => {
    return acc + parseInt(torrent["d.get_up_rate"]);
  }, 0);

  const download = statusData.reduce((acc, torrent) => {
    return acc + parseInt(torrent["d.get_down_rate"]);
  }, 0);

  const active = statusData.filter((torrent) => torrent["d.get_state"] === "1");

  return (
    <Widget>
      <Block label="Active" value={active.length} />
      <Block label="Upload" value={`${formatBytes(upload)}/s`} />
      <Block label="Download" value={`${formatBytes(download)}/s`} />
    </Widget>
  );
}
