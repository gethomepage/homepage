import { useTranslation } from "next-i18next";

import Container from "components/services/widget/container";
import Block from "components/services/widget/block";
import useWidgetAPI from "utils/proxy/use-widget-api";

export default function Component({ service }) {
  const { t } = useTranslation();

  const { widget } = service;

  const { data: artistsData, error: artistsError } = useWidgetAPI(widget, "artist");
  const { data: wantedData, error: wantedError } = useWidgetAPI(widget, "wanted/missing");
  const { data: queueData, error: queueError } = useWidgetAPI(widget, "queue/status");

  if (artistsError || wantedError || queueError) {
    const finalError = artistsError ?? wantedError ?? queueError;
    return <Container service={service} error={finalError} />;
  }

  if (!artistsData || !wantedData || !queueData) {
    return (
      <Container service={service}>
        <Block label="lidarr.wanted" />
        <Block label="lidarr.queued" />
        <Block label="lidarr.artists" />
      </Container>
    );
  }

  return (
    <Container service={service}>
      <Block label="lidarr.wanted" value={t("common.number", { value: wantedData.totalRecords })} />
      <Block label="lidarr.queued" value={t("common.number", { value: queueData.totalCount })} />
      <Block label="lidarr.artists" value={t("common.number", { value: artistsData.length })} />
    </Container>
  );
}
