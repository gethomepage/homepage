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
    return <Container error={t("widget.api_error")} />;
  }

  if (!moviesData || !queuedData) {
    return (
      <Container>
        <Block label={t("radarr.wanted")} />
        <Block label={t("radarr.queued")} />
        <Block label={t("radarr.movies")} />
      </Container>
    );
  }

  return (
    <Container>
      <Block label={t("radarr.wanted")} value={moviesData.wanted} />
      <Block label={t("radarr.queued")} value={queuedData.totalCount} />
      <Block label={t("radarr.movies")} value={moviesData.have} />
    </Container>
  );
}
