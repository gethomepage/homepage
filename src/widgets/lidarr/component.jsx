import { useTranslation } from "next-i18next";

import Container from "components/services/widget/container";
import Block from "components/services/widget/block";
import useWidgetAPI from "utils/proxy/use-widget-api";

export default function Component({ service }) {
  const { t } = useTranslation();

  const { widget } = service;

  const { data: albumsData, error: albumsError } = useWidgetAPI(widget, "album");
  const { data: wantedData, error: wantedError } = useWidgetAPI(widget, "wanted/missing");
  const { data: queueData, error: queueError } = useWidgetAPI(widget, "queue/status");

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
