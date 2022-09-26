import useSWR from "swr";
import { useTranslation } from "next-i18next";

import Widget from "components/services/widgets/widget";
import Block from "components/services/widgets/block";
import { formatProxyUrl } from "utils/api-helpers";

export default function Component({ service }) {
  const { t } = useTranslation();

  const config = service.widget;

  const { data: albumsData, error: albumsError } = useSWR(formatProxyUrl(config, "album"));
  const { data: wantedData, error: wantedError } = useSWR(formatProxyUrl(config, "wanted/missing"));
  const { data: queueData, error: queueError } = useSWR(formatProxyUrl(config, "queue/status"));

  if (albumsError || wantedError || queueError) {
    return <Widget error={t("widget.api_error")} />;
  }

  if (!albumsData || !wantedData || !queueData) {
    return (
      <Widget>
        <Block label={t("lidarr.wanted")} />
        <Block label={t("lidarr.queued")} />
        <Block label={t("lidarr.albums")} />
      </Widget>
    );
  }

  return (
    <Widget>
      <Block label={t("lidarr.wanted")} value={t("common.number", { value: wantedData.totalRecords })} />
      <Block label={t("lidarr.queued")} value={t("common.number", { value: queueData.totalCount })} />
      <Block label={t("lidarr.albums")} value={t("common.number", { value: albumsData.have })} />
    </Widget>
  );
}
