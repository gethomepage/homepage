import useSWR from "swr";

import Widget from "../widget";
import Block from "../block";

export default function Emby({ service }) {
  const config = service.widget;

  function buildApiUrl(endpoint) {
    const { url, key } = config;
    return `${url}/emby/${endpoint}?api_key=${key}`;
  }

  const { data: sessionsData, error: sessionsError } = useSWR(buildApiUrl(`Sessions`), {
    refreshInterval: 1000,
  });

  if (sessionsError) {
    return <Widget error="Emby API Error" />;
  }

  if (!sessionsData) {
    return (
      <Widget>
        <Block label="Playing" />
        <Block label="Transcoding" />
        <Block label="Bitrate" />
      </Widget>
    );
  }

  const playing = sessionsData.filter((session) => session.hasOwnProperty("NowPlayingItem"));
  const transcoding = sessionsData.filter(
    (session) => session.hasOwnProperty("PlayState") && session.PlayState.PlayMethod === "Transcode"
  );
  const bitrate = playing.reduce((acc, session) => acc + session.NowPlayingItem.Bitrate, 0);

  return (
    <Widget>
      <Block label="Playing" value={playing.length} />
      <Block label="Transcoding" value={transcoding.length} />
      <Block label="Bitrate" value={`${Math.round((bitrate / 1024 / 1024) * 100) / 100} Mbps`} />
    </Widget>
  );
}
