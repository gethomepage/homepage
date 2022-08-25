import useSWR from "swr";
import RuTorrent from "rutorrent-promise";

import { formatBytes } from "utils/stats-helpers";

import Widget from "../widget";
import Block from "../block";

export default function Rutorrent({ service }) {
  const config = service.widget;

  function buildApiUrl() {
    const { url, username, password } = config;

    const options = {
      url: `${url}/plugins/httprpc/action.php`,
    };

    if (username && password) {
      options.username = username;
      options.password = password;
    }

    const params = new URLSearchParams(options);

    return `/api/widgets/rutorrent?${params.toString()}`;
  }

  const { data: statusData, error: statusError } = useSWR(buildApiUrl());

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
