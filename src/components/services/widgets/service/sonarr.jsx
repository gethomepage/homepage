import useSWR from "swr";
import { useTranslation } from "react-i18next";

import Widget from "../widget";
import Block from "../block";

import { formatApiUrl } from "utils/api-helpers";

export default function Sonarr({ service }) {
  const { t } = useTranslation();

  const config = service.widget;

  const { data: wantedData, error: wantedError } = useSWR(formatApiUrl(config, "wanted/missing"));
  const { data: queuedData, error: queuedError } = useSWR(formatApiUrl(config, "queue"));
  const { data: seriesData, error: seriesError } = useSWR(formatApiUrl(config, "series"));

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
      <Block label={t("sonarr.series")} value={seriesData.length} />
    </Widget>
  );
}
