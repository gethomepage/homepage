import { useTranslation } from "next-i18next/pages";

import Block from "components/services/widget/block";
import Container from "components/services/widget/container";
import useWidgetAPI from "utils/proxy/use-widget-api";
import withWidgetFields from "utils/widget-fields";

const DEFAULT_FIELDS = ["books", "authors", "reading", "finished"];

export default function Component({ service: configuredService }) {
  const { t } = useTranslation();
  const service = withWidgetFields(configuredService, DEFAULT_FIELDS);
  const { widget } = service;

  const { data, error } = useWidgetAPI(widget);

  if (error) {
    return <Container service={service} error={error} />;
  }

  if (!data) {
    return (
      <Container service={service}>
        <Block label="bookorbit.books" />
        <Block label="bookorbit.authors" />
        <Block label="bookorbit.series" />
        <Block label="bookorbit.storage" />
        <Block label="bookorbit.reading" />
        <Block label="bookorbit.finished" />
      </Container>
    );
  }

  return (
    <Container service={service}>
      <Block label="bookorbit.books" value={t("common.number", { value: data.books })} />
      <Block label="bookorbit.authors" value={t("common.number", { value: data.authors })} />
      <Block label="bookorbit.series" value={t("common.number", { value: data.series })} />
      <Block label="bookorbit.storage" value={t("common.bbytes", { value: data.storage, maximumFractionDigits: 1 })} />
      <Block label="bookorbit.reading" value={t("common.number", { value: data.reading })} />
      <Block label="bookorbit.finished" value={t("common.number", { value: data.finished })} />
    </Container>
  );
}
