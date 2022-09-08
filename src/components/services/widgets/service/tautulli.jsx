import useSWR from "swr";
import { useTranslation } from "react-i18next";

import Widget from "../widget";
import Block from "../block";

import { formatApiUrl } from "utils/api-helpers";

export default function Tautulli({ service }) {
  const { t } = useTranslation();

  const config = service.widget;

  const { data: statsData, error: statsError } = useSWR(formatApiUrl(config, "get_activity"));

  if (statsError) {
    return <Widget error={t("widget.api_error")} />;
  }

  if (!statsData) {
    return (
      <Widget>
        <Block label={t("tautulli.playing")} />
        <Block label={t("tautulli.transcoding")} />
        <Block label={t("tautulli.bitrate")} />
      </Widget>
    );
  }

  const { data } = statsData.response;

  return (
    <Widget>
      <Block label={t("tautulli.playing")} value={data.stream_count} />
      <Block label={t("tautulli.transcoding")} value={data.stream_count_transcode} />
      <Block label={t("tautulli.bitrate")} value={t("common.bitrate", { value: data.total_bandwidth })} />
    </Widget>
  );
}
