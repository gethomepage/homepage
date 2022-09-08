import useSWR from "swr";
import { useTranslation } from "react-i18next";

import Widget from "../widget";
import Block from "../block";

import { formatApiUrl } from "utils/api-helpers";

export default function Radarr({ service }) {
  const { t } = useTranslation();

  const config = service.widget;

  const { data: moviesData, error: moviesError } = useSWR(formatApiUrl(config, "movie"));
  const { data: queuedData, error: queuedError } = useSWR(formatApiUrl(config, "queue/status"));

  if (moviesError || queuedError) {
    return <Widget error={t("widget.api_error")} />;
  }

  if (!moviesData || !queuedData) {
    return (
      <Widget>
        <Block label={t("radarr.wanted")} />
        <Block label={t("radarr.queued")} />
        <Block label={t("radarr.movies")} />
      </Widget>
    );
  }

  const wanted = moviesData.filter((movie) => movie.isAvailable === false);
  const have = moviesData.filter((movie) => movie.isAvailable === true);

  return (
    <Widget>
      <Block label={t("radarr.wanted")} value={wanted.length} />
      <Block label={t("radarr.queued")} value={queuedData.totalCount} />
      <Block label={t("radarr.movies")} value={have.length} />
    </Widget>
  );
}
