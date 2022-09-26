import useSWR from "swr";
import { useTranslation } from "next-i18next";

import Container from "components/services/widget/container";
import Block from "components/services/widget/block";
import { formatProxyUrl } from "utils/proxy/api-helpers";

export default function Component({ service }) {
  const { t } = useTranslation();

  const config = service.widget;

  const { data: moviesData, error: moviesError } = useSWR(formatProxyUrl(config, "movie"));
  const { data: queuedData, error: queuedError } = useSWR(formatProxyUrl(config, "queue/status"));

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
