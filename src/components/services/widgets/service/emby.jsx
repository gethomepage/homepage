import useSWR from "swr";

import Widget from "../widget";
import Block from "../block";

import { formatApiUrl } from "utils/api-helpers";

export default function Emby({ service, title = "Emby" }) {
  const config = service.widget;

  const { data: sessionsData, error: sessionsError } = useSWR(formatApiUrl(config, "Sessions"));

  if (sessionsError) {
    return <Widget error={`${title} API Error`} />;
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

  const playing = sessionsData.filter((session) => session?.NowPlayingItem);
  const transcoding = sessionsData.filter(
    (session) => session?.PlayState && session.PlayState.PlayMethod === "Transcode"
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
