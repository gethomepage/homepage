import { useTranslation } from "next-i18next";

import Container from "components/services/widget/container";
import Block from "components/services/widget/block";
import useWidgetAPI from "utils/proxy/use-widget-api";

export default function Component({ service }) {
  const { t } = useTranslation();
  const { widget } = service;

  const { data: libraryData, error: libraryError } = useWidgetAPI(widget, "libraries");
  const { data: seriesData, error: seriesError } = useWidgetAPI(widget, "series");
  const { data: bookData, error: bookError } = useWidgetAPI(widget, "books");

  if (libraryError || seriesError || bookError) {
    const finalError = libraryError ?? seriesError ?? bookError;
    return <Container error={finalError} />;
  }

  if (!libraryError || !seriesError || !bookError) {
    return (
      <Container service={service}>
        <Block label="komga.libraries" />
        <Block label="komga.series" />
        <Block label="komga.books" />
      </Container>
    );
  }

  return (
    <Container service={service}>
      <Block label="komga.libraries" value={t("common.number", { value: libraryData.total })} />
      <Block label="komga.series" value={t("common.number", { value: seriesData.totalElements })} />
      <Block label="komga.books" value={t("common.number", { value: bookData.totalElements })} />
    </Container>
  );
}