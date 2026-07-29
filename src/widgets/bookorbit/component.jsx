import Block from "components/services/widget/block";
import Container from "components/services/widget/container";
import { useTranslation } from "next-i18next/pages";

import useWidgetAPI from "utils/proxy/use-widget-api";

export default function Component({ service }) {
  const { t } = useTranslation();
  const { widget } = service;

  const { data: bookorbitData, error: bookorbitError } = useWidgetAPI(widget);

  if (bookorbitError) {
    return <Container service={service} error={bookorbitError} />;
  }

  if (!bookorbitData) {
    return (
      <Container service={service}>
        <Block label="bookorbit.libraries" />
        <Block label="bookorbit.books" />
        <Block label="bookorbit.reading" />
        <Block label="bookorbit.finished" />
      </Container>
    );
  }

  const stats = {
    libraries: bookorbitData.libraries ?? 0,
    books: bookorbitData.books ?? 0,
    reading: bookorbitData.reading ?? 0,
    finished: bookorbitData.finished ?? 0,
  };

  return (
    <Container service={service}>
      <Block label="bookorbit.libraries" value={t("common.number", { value: stats.libraries })} />
      <Block label="bookorbit.books" value={t("common.number", { value: stats.books })} />
      <Block label="bookorbit.reading" value={t("common.number", { value: stats.reading })} />
      <Block label="bookorbit.finished" value={t("common.number", { value: stats.finished })} />
    </Container>
  );
}
