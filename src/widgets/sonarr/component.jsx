import useSWR from "swr";
import { useTranslation } from "next-i18next";

import Container from "components/services/widget/container";
import Block from "components/services/widget/block";
import { formatProxyUrl } from "utils/proxy/api-helpers";

export default function Component({ service }) {
  const { t } = useTranslation();

  const config = service.widget;

  const { data: wantedData, error: wantedError } = useSWR(formatProxyUrl(config, "wanted/missing"));
  const { data: queuedData, error: queuedError } = useSWR(formatProxyUrl(config, "queue"));
  const { data: seriesData, error: seriesError } = useSWR(formatProxyUrl(config, "series"));

  if (wantedError || queuedError || seriesError) {
    return <Container error={t("widget.api_error")} />;
  }

  if (!wantedData || !queuedData || !seriesData) {
    return (
      <Container>
        <Block label={t("sonarr.wanted")} />
        <Block label={t("sonarr.queued")} />
        <Block label={t("sonarr.series")} />
      </Container>
    );
  }

  return (
    <Container>
      <Block label={t("sonarr.wanted")} value={wantedData.totalRecords} />
      <Block label={t("sonarr.queued")} value={queuedData.totalRecords} />
      <Block label={t("sonarr.series")} value={seriesData.total} />
    </Container>
  );
}
