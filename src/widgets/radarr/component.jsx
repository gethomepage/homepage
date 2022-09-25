import useSWR from "swr";
import { useTranslation } from "next-i18next";

import Widget from "components/services/widgets/widget";
import Block from "components/services/widgets/block";
import { formatProxyUrl } from "utils/api-helpers";

export default function Component({ service }) {
  const { t } = useTranslation();

  const config = service.widget;

  const { data: moviesData, error: moviesError } = useSWR(formatProxyUrl(config, "movie"));
  const { data: queuedData, error: queuedError } = useSWR(formatProxyUrl(config, "queue/status"));

  if (moviesError || queuedError) {
    return <Widget error={t("widget.api_error")} />;
  }

  if (!moviesData || !queuedData) {
    return (
      <Widget>
        <Block label={t("radarr.wanted")} />
        <Block label={t("radarr.queued")} />
        <Block label={t("radarr.movies")} />
      </Widget>
    );
  }

  return (
    <Widget>
      <Block label={t("radarr.wanted")} value={moviesData.wanted} />
      <Block label={t("radarr.queued")} value={queuedData.totalCount} />
      <Block label={t("radarr.movies")} value={moviesData.have} />
    </Widget>
  );
}
