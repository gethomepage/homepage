import useSWR from "swr";
import { useTranslation } from "react-i18next";

import Widget from "../widget";
import Block from "../block";

import { formatApiUrl } from "utils/api-helpers";

export default function Emby({ service }) {
  const { t } = useTranslation();

  const config = service.widget;

  const { data: sessionsData, error: sessionsError } = useSWR(formatApiUrl(config, "Sessions"));

  if (sessionsError) {
    return <Widget error={t("docker.api_error")} />;
  }

  if (!sessionsData) {
    return (
      <Widget>
        <Block label={t("emby.playing")} />
        <Block label={t("emby.transcoding")} />
        <Block label={t("emby.bitrate")} />
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
      <Block label={t("emby.playing")} value={playing.length} />
      <Block label={t("emby.transcoding")} value={transcoding.length} />
      <Block label={t("emby.bitrate")} value={t("common.bitrate", { value: bitrate })} />
    </Widget>
  );
}
