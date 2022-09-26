import useSWR from "swr";
import { useTranslation } from "next-i18next";

import Container from "components/services/widget/container";
import Block from "components/services/widget/block";
import { formatProxyUrl } from "utils/proxy/api-helpers";

export default function Component({ service }) {
  const { t } = useTranslation();

  const config = service.widget;

  const { data: albumsData, error: albumsError } = useSWR(formatProxyUrl(config, "album"));
  const { data: wantedData, error: wantedError } = useSWR(formatProxyUrl(config, "wanted/missing"));
  const { data: queueData, error: queueError } = useSWR(formatProxyUrl(config, "queue/status"));

  if (albumsError || wantedError || queueError) {
    return <Container error={t("widget.api_error")} />;
  }

  if (!albumsData || !wantedData || !queueData) {
    return (
      <Container>
        <Block label={t("lidarr.wanted")} />
        <Block label={t("lidarr.queued")} />
        <Block label={t("lidarr.albums")} />
      </Container>
    );
  }

  return (
    <Container>
      <Block label={t("lidarr.wanted")} value={t("common.number", { value: wantedData.totalRecords })} />
      <Block label={t("lidarr.queued")} value={t("common.number", { value: queueData.totalCount })} />
      <Block label={t("lidarr.albums")} value={t("common.number", { value: albumsData.have })} />
    </Container>
  );
}
