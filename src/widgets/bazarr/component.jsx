import { useTranslation } from "next-i18next";

import Container from "components/services/widget/container";
import Block from "components/services/widget/block";
import useWidgetAPI from "utils/proxy/use-widget-api";

export default function Component({ service }) {
  const { t } = useTranslation();

  const { widget } = service;

  const { data: episodesData, error: episodesError } = useWidgetAPI(widget, "episodes");
  const { data: moviesData, error: moviesError } = useWidgetAPI(widget, "movies");

  if (moviesError || moviesData?.error || episodesError || episodesData?.error) {
    const finalError = moviesError ?? moviesData?.error ?? episodesError ?? episodesData?.error;
    return <Container error={finalError} />;
  }

  if (!episodesData || !moviesData) {
    return (
      <Container service={service}>
        <Block label="bazarr.missingEpisodes" />
        <Block label="bazarr.missingMovies" />
      </Container>
    );
  }

  return (
    <Container service={service}>
      <Block label="bazarr.missingEpisodes" value={t("common.number", { value: episodesData.total })} />
      <Block label="bazarr.missingMovies" value={t("common.number", { value: moviesData.total })} />
    </Container>
  );
}
