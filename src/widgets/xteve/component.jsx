import { useTranslation } from "next-i18next";

import Container from "components/services/widget/container";
import Block from "components/services/widget/block";
import useWidgetAPI from "utils/proxy/use-widget-api";

export default function Component({ service }) {
  const { t } = useTranslation();

  const { widget } = service;

  const { data: xteveData, error: xteveError } = useWidgetAPI(widget);

  if (xteveError) {
    return <Container service={service} error={xteveError} />;
  }

  if (!xteveData) {
    return (
      <Container service={service}>
        <Block label="xteve.streams_all" />
        <Block label="xteve.streams_active " />
        <Block label="xteve.streams_xepg" />
      </Container>
    );
  }

  return (
    <Container service={service}>
      <Block label="xteve.streams_all" value={t("common.number", { value: xteveData["streams.all"] ?? 0 })} />
      <Block label="xteve.streams_active" value={t("common.number", { value: xteveData["streams.active"] ?? 0 })} />
      <Block label="xteve.streams_xepg" value={t("common.number", { value: xteveData["streams.xepg"] ?? 0 })} />
    </Container>
  );
}
