import { useTranslation } from "next-i18next";

import Container from "components/services/widget/container";
import Block from "components/services/widget/block";
import useWidgetAPI from "utils/proxy/use-widget-api";

export default function Component({ service }) {
  const { t } = useTranslation();

  const { widget } = service;

  const { data: episodesData, error: episodesError } = useWidgetAPI(widget, "episodes");
  const { data: moviesData, error: moviesError } = useWidgetAPI(widget, "movies");

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
