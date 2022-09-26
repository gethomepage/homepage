import useSWR from "swr";
import { useTranslation } from "next-i18next";

import Container from "components/services/widget/container";
import Block from "components/services/widget/block";
import { formatProxyUrl } from "utils/proxy/api-helpers";

export default function Component({ service }) {
  const { t } = useTranslation();

  const config = service.widget;

  const { data: episodesData, error: episodesError } = useSWR(formatProxyUrl(config, "episodes"));
  const { data: moviesData, error: moviesError } = useSWR(formatProxyUrl(config, "movies"));

  if (episodesError || moviesError) {
    return <Container error={t("widget.api_error")} />;
  }

  if (!episodesData || !moviesData) {
    return (
      <Container>
        <Block label={t("bazarr.missingEpisodes")} />
        <Block label={t("bazarr.missingMovies")} />
      </Container>
    );
  }

  return (
    <Container>
      <Block label={t("bazarr.missingEpisodes")} value={t("common.number", { value: episodesData.total })} />
      <Block label={t("bazarr.missingMovies")} value={t("common.number", { value: moviesData.total })} />
    </Container>
  );
}
