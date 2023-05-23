import { useTranslation } from "next-i18next";

import Container from "components/services/widget/container";
import Block from "components/services/widget/block";
import useWidgetAPI from "utils/proxy/use-widget-api";

export default function Component({ service }) {
  const { t } = useTranslation();

  const { widget } = service;
  const { data: booksData, error: booksError } = useWidgetAPI(widget, "books");
  const { data: authorsData, error: authorsError } = useWidgetAPI(widget, "authors");
  const { data: seriesData, error: seriesError } = useWidgetAPI(widget, "series");

  if (booksError || authorsError || seriesError) {
    const finalError = booksError ?? authorsError ?? seriesError;
    return <Container service={service} error={finalError} />;
  }

  if (!booksData || !authorsData || !seriesData) {
    return (
      <Container service={service}>
        <Block label="calibreweb.books" />
        <Block label="calibreweb.authors" />
        <Block label="calibreweb.series" />
      </Container>
    );
  }

  return (
    <Container service={service}>
      <Block label="calibreweb.books" value={t("common.number", { value: booksData.total })} />  
      <Block label="calibreweb.authors" value={t("common.number", { value: authorsData.length })} />
      <Block label="calibreweb.series" value={t("common.number", { value: seriesData.length })} />
    </Container>
  );
}
