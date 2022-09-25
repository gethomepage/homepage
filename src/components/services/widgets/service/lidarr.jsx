import useSWR from "swr";
import { useTranslation } from "next-i18next";

import Widget from "../widget";
import Block from "../block";

import { formatApiUrl } from "utils/api-helpers";

export default function Lidarr({ service }) {
  const { t } = useTranslation();

  const config = service.widget;

  const { data: albumsData, error: albumsError } = useSWR(formatApiUrl(config, "album"));
  const { data: wantedData, error: wantedError } = useSWR(formatApiUrl(config, "wanted/missing"));
  const { data: queueData, error: queueError } = useSWR(formatApiUrl(config, "queue/status"));

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
