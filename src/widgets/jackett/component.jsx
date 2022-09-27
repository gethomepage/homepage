import { useTranslation } from "next-i18next";

import Container from "components/services/widget/container";
import Block from "components/services/widget/block";
import useWidgetAPI from "utils/proxy/use-widget-api";

export default function Component({ service }) {
  const { t } = useTranslation();

  const { widget } = service;

  const { data: indexersData, error: indexersError } = useWidgetAPI(widget, "indexers");

  if (indexersError) {
    return <Container error={t("widget.api_error")} />;
  }

  if (!indexersData) {
    return (
      <Container>
        <Block label={t("jackett.configured")} />
        <Block label={t("jackett.errored")} />
      </Container>
    );
  }

  const errored = indexersData.filter((indexer) => indexer.last_error);

  return (
    <Container>
      <Block label={t("jackett.configured")} value={t("common.number", { value: indexersData.length })} />
      <Block label={t("jackett.errored")} value={t("common.number", { value: errored.length })} />
    </Container>
  );
}
