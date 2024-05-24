import { useTranslation } from "next-i18next";

import Container from "components/services/widget/container";
import Block from "components/services/widget/block";
import useWidgetAPI from "utils/proxy/use-widget-api";

export default function Component({ service }) {
  const { t } = useTranslation();
  const { widget } = service;

  const { collectionId } = widget;

  const { data: collectionData, error: statsError } = useWidgetAPI(widget, "collection");

  if (statsError) {
    return <Container service={service} error={statsError} />;
  }

  if (!collectionData) {
    return (
      <Container service={service}>
        <Block label="overseerr.pending" />
        <Block label="overseerr.processing" />
        <Block label="overseerr.approved" />
        <Block label="overseerr.available" />
      </Container>
    );
  }
  
  const totalSizes = collectionData.items.map((item) => {
    const mediaSize = item.plexData.Media.map((media) => {
      const totalPartSizes = media.Part.reduce((a, b) => a + b.size, 0)
      return totalPartSizes
    }).reduce((a, b) => a + b, 0)
    return mediaSize
  }).reduce((a, b) => a + b, 0);

  const items = collectionData.items.length;

  return (
    <Container service={service}>
      <Block label="maintainerr.usage" value={t("common.bytes", { value: totalSizes })} />
      <Block label="maintainerr.items" value={t("common.number", { value: items })} />
    </Container>
  );
}
