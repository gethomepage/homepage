import { useTranslation } from "next-i18next";

import Container from "components/services/widget/container";
import Block from "components/services/widget/block";
import useWidgetAPI from "utils/proxy/use-widget-api";

export default function Component({ service }) {
  const { t } = useTranslation();

  const { widget } = service;

  const { data: indexersData, error: indexersError } = useWidgetAPI(widget, "indexers");

  if (indexersError) {
    return <Container error={indexersError} />;
  }

  if (!indexersData) {
    return (
      <Container service={service}>
        <Block label="jackett.configured" />
        <Block label="jackett.errored" />
      </Container>
    );
  }

  const errored = indexersData.filter((indexer) => indexer.last_error);

  return (
    <Container service={service}>
      <Block label="jackett.configured" value={t("common.number", { value: indexersData.length })} />
      <Block label="jackett.errored" value={t("common.number", { value: errored.length })} />
    </Container>
  );
}
