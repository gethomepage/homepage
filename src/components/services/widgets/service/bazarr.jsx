import useSWR from "swr";
import { useTranslation } from "next-i18next";

import Widget from "../widget";
import Block from "../block";

import { formatApiUrl } from "utils/api-helpers";

export default function Bazarr({ service }) {
  const { t } = useTranslation();

  const config = service.widget;

  const { data: episodesData, error: episodesError } = useSWR(formatApiUrl(config, "episodes"));
  const { data: moviesData, error: moviesError } = useSWR(formatApiUrl(config, "movies"));

  if (episodesError || moviesError) {
    return <Widget error={t("widget.api_error")} />;
  }

  if (!episodesData || !moviesData) {
    return (
      <Widget>
        <Block label={t("bazarr.missingEpisodes")} />
        <Block label={t("bazarr.missingMovies")} />
      </Widget>
    );
  }

  return (
    <Widget>
      <Block label={t("bazarr.missingEpisodes")} value={t("common.number", { value: episodesData.total })} />
      <Block label={t("bazarr.missingMovies")} value={t("common.number", { value: moviesData.total })} />
    </Widget>
  );
}
