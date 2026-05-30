import Block from "components/services/widget/block";
import Container from "components/services/widget/container";
import { useTranslation } from "next-i18next";

import useWidgetAPI from "utils/proxy/use-widget-api";

export default function Component({ service }) {
  const { t } = useTranslation();
  const { widget } = service;

  const { data: grimmoryData, error: grimmoryError } = useWidgetAPI(widget);

  if (grimmoryError) {
    return <Container service={service} error={grimmoryError} />;
  }

  if (!grimmoryData) {
    return (
      <Container service={service}>
        <Block label="grimmory.libraries" />
        <Block label="grimmory.books" />
        <Block label="grimmory.reading" />
        <Block label="grimmory.finished" />
      </Container>
    );
  }

  const stats = {
    libraries: grimmoryData.libraries ?? 0,
    books: grimmoryData.books ?? 0,
    reading: grimmoryData.reading ?? 0,
    finished: grimmoryData.finished ?? 0,
  };

  return (
    <Container service={service}>
      <Block label="grimmory.libraries" value={t("common.number", { value: stats.libraries })} />
      <Block label="grimmory.books" value={t("common.number", { value: stats.books })} />
      <Block label="grimmory.reading" value={t("common.number", { value: stats.reading })} />
      <Block label="grimmory.finished" value={t("common.number", { value: stats.finished })} />
    </Container>
  );
}
