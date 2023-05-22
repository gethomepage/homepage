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
    const finalError = albumsError ?? wantedError ?? queueError;
    return <Container service={service} error={finalError} />;
  }

  if (!albumsData || !wantedData || !queueData) {
    return (
      <Container service={service}>
        <Block label="lidarr.wanted" />
        <Block label="lidarr.queued" />
        <Block label="lidarr.albums" />
      </Container>
    );
  }

  return (
    <Container service={service}>
      <Block label="lidarr.wanted" value={t("common.number", { value: wantedData.totalRecords })} />
      <Block label="lidarr.queued" value={t("common.number", { value: queueData.totalCount })} />
      <Block label="lidarr.albums" value={t("common.number", { value: albumsData.have })} />
    </Container>
  );
}
