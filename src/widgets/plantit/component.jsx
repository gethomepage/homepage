import { useTranslation } from "next-i18next";

import Container from "components/services/widget/container";
import Block from "components/services/widget/block";
import useWidgetAPI from "utils/proxy/use-widget-api";

export default function Component({ service }) {
  const { t } = useTranslation();

  const { widget } = service;

  const { data: plantitData, error: plantitError } = useWidgetAPI(widget, "plantit");

  if (plantitError) {
    return <Container service={service} error={plantitError} />;
  }

  if (!plantitData) {
    return (
      <Container service={service}>
        <Block label="plantit.events" />
        <Block label="plantit.plants" />
        <Block label="plantit.photos" />
        <Block label="plantit.species" />
      </Container>
    );
  }

  return (
    <Container service={service}>
      <Block label="plantit.events" value={t("common.number", { value: plantitData.diaryEntryCount })} />
      <Block label="plantit.plants" value={t("common.number", { value: plantitData.plantCount })} />
      <Block label="plantit.photos" value={t("common.number", { value: plantitData.imageCount })} />
      <Block label="plantit.species" value={t("common.number", { value: plantitData.botanicalInfoCount })} />
    </Container>
  );
}
