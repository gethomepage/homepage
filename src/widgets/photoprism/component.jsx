import { useTranslation } from "next-i18next";

import Container from "components/services/widget/container";
import Block from "components/services/widget/block";
import useWidgetAPI from "utils/proxy/use-widget-api";

export default function Component({ service }) {
  const { t } = useTranslation();

  const { widget } = service;

  const { data: photoprismData, error: photoprismError } = useWidgetAPI(widget);

  if (photoprismError) {
    return <Container error={photoprismError} />;
  }

  if (!photoprismData) {
    return (
      <Container service={service}>
        <Block label="photoprism.albums" />
        <Block label="photoprism.photos" />
        <Block label="photoprism.videos" />
        <Block label="photoprism.people" />
      </Container>
    );
  }

  return (
    <Container service={service}>
      <Block label="photoprism.albums" value={t("common.number", { value: photoprismData.albums + photoprismData.folders })} />
      <Block label="photoprism.photos" value={t("common.number", { value: photoprismData.photos })} />
      <Block label="photoprism.videos" value={t("common.number", { value: photoprismData.videos })} />
      <Block label="photoprism.people" value={t("common.number", { value: photoprismData.people })} />
    </Container>
  );
}
