import Block from "components/services/widget/block";
import Container from "components/services/widget/container";
import { useTranslation } from "next-i18next";

import useWidgetAPI from "utils/proxy/use-widget-api";

export default function Component({ service }) {
  const { t } = useTranslation();
  const { widget } = service;

  const { data: bookloreData, error: bookloreError } = useWidgetAPI(widget);

  if (bookloreError) {
    return <Container service={service} error={bookloreError} />;
  }

  if (!bookloreData) {
    return (
      <Container service={service}>
        <Block label="booklore.libraries" />
        <Block label="booklore.books" />
        <Block label="booklore.reading" />
        <Block label="booklore.finished" />
      </Container>
    );
  }

  const stats = {
    libraries: bookloreData.libraries ?? 0,
    books: bookloreData.books ?? 0,
    reading: bookloreData.reading ?? 0,
    finished: bookloreData.finished ?? 0,
  };

  return (
    <Container service={service}>
      <Block label="booklore.libraries" value={t("common.number", { value: stats.libraries })} />
      <Block label="booklore.books" value={t("common.number", { value: stats.books })} />
      <Block label="booklore.reading" value={t("common.number", { value: stats.reading })} />
      <Block label="booklore.finished" value={t("common.number", { value: stats.finished })} />
    </Container>
  );
}
