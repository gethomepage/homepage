import useSWR from "swr";
import { useTranslation } from "next-i18next";

import Widget from "components/services/widgets/widget";
import Block from "components/services/widgets/block";
import { formatProxyUrl } from "utils/api-helpers";

export default function Component({ service }) {
  const { t } = useTranslation();

  const config = service.widget;

  const { data: wantedData, error: wantedError } = useSWR(formatProxyUrl(config, "wanted/missing"));
  const { data: queuedData, error: queuedError } = useSWR(formatProxyUrl(config, "queue"));
  const { data: seriesData, error: seriesError } = useSWR(formatProxyUrl(config, "series"));

  if (wantedError || queuedError || seriesError) {
    return <Widget error={t("widget.api_error")} />;
  }

  if (!wantedData || !queuedData || !seriesData) {
    return (
      <Widget>
        <Block label={t("sonarr.wanted")} />
        <Block label={t("sonarr.queued")} />
        <Block label={t("sonarr.series")} />
      </Widget>
    );
  }

  return (
    <Widget>
      <Block label={t("sonarr.wanted")} value={wantedData.totalRecords} />
      <Block label={t("sonarr.queued")} value={queuedData.totalRecords} />
      <Block label={t("sonarr.series")} value={seriesData.total} />
    </Widget>
  );
}
