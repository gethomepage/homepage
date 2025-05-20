import Block from "components/services/widget/block";
import Container from "components/services/widget/container";
import { useTranslation } from "next-i18next";

import useWidgetAPI from "utils/proxy/use-widget-api";

export default function Component({ service }) {
  const { t } = useTranslation();
  const { widget } = service;

  const { data: komgaData, error: komgaError } = useWidgetAPI(widget);

  if (komgaError) {
    return <Container service={service} error={komgaError} />;
  }

  if (!komgaData) {
    return (
      <Container service={service}>
        <Block label="komga.libraries" />
        <Block label="komga.series" />
        <Block label="komga.books" />
      </Container>
    );
  }

  const { libraries: libraryData, series: seriesData, books: bookData } = komgaData;

  return (
    <Container service={service}>
      <Block label="komga.libraries" value={t("common.number", { value: libraryData.length })} />
      <Block label="komga.series" value={t("common.number", { value: seriesData.totalElements })} />
      <Block label="komga.books" value={t("common.number", { value: bookData.totalElements })} />
    </Container>
  );
}
