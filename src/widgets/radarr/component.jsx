import { useTranslation } from "next-i18next";

import Container from "components/services/widget/container";
import Block from "components/services/widget/block";
import useWidgetAPI from "utils/proxy/use-widget-api";

export default function Component({ service }) {
  const { t } = useTranslation();
  const { widget } = service;

  const { data: moviesData, error: moviesError } = useWidgetAPI(widget, "movie");
  const { data: queuedData, error: queuedError } = useWidgetAPI(widget, "queue/status");

  if (moviesError || queuedError) {
    const finalError = moviesError ?? queuedError;
    return <Container error={finalError} />;
  }

  if (!moviesData || !queuedData) {
    return (
      <Container service={service}>
        <Block label="radarr.wanted" />
        <Block label="radarr.missing" />
        <Block label="radarr.queued" />
        <Block label="radarr.movies" />
      </Container>
    );
  }

  return (
    <Container service={service}>
      <Block label="radarr.wanted" value={t("common.number", { value: moviesData.wanted })} />
      <Block label="radarr.missing" value={t("common.number", { value: moviesData.missing })} />
      <Block label="radarr.queued" value={t("common.number", { value: queuedData.totalCount })} />
      <Block label="radarr.movies" value={t("common.number", { value: moviesData.have })} />
    </Container>
  );
}
