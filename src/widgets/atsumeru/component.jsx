import { useTranslation } from "next-i18next";

import Container from "components/services/widget/container";
import Block from "components/services/widget/block";
import useWidgetAPI from "utils/proxy/use-widget-api";

export default function Component({ service }) {
  const { t } = useTranslation();
  const { widget } = service;

  const { data: infoData, error: infoError } = useWidgetAPI(widget, "info");

  if (infoError) {
    return <Container service={service} error={infoError} />;
  }

  if (!infoData) {
    return (
      <Container service={service}>
        <Block label="atsumeru.series" />
        <Block label="atsumeru.archives" />
        <Block label="atsumeru.chapters" />
        <Block label="atsumeru.categories" />
      </Container>
    );
  }

  return (
    <Container service={service}>
      <Block label="atsumeru.series" value={t("common.number", { value: infoData.stats.total_series })} />
      <Block label="atsumeru.archives" value={t("common.number", { value: infoData.stats.total_archives })} />
      <Block label="atsumeru.chapters" value={t("common.number", { value: infoData.stats.total_chapters })} />
      <Block label="atsumeru.categories" value={t("common.number", { value: infoData.stats.total_categories })} />
    </Container>
  );
}
