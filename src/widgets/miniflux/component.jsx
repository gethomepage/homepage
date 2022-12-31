import { useTranslation } from "next-i18next";

import Container from "components/services/widget/container";
import Block from "components/services/widget/block";
import useWidgetAPI from "utils/proxy/use-widget-api";

export default function Component({ service }) {
  const { t } = useTranslation();

  const { widget } = service;

  const { data: minifluxData, error: minifluxError } = useWidgetAPI(widget, "counters");

  if (minifluxError) {
    return <Container error={minifluxError} />;
  }

  if (!minifluxData) {
    return (
      <Container service={service}>
        <Block label="miniflux.unread" />
        <Block label="miniflux.read" />
      </Container>
    );
  }

  return (
    <Container service={service}>
      <Block label="miniflux.unread" value={t("common.number", { value: minifluxData.unread })} />
      <Block label="miniflux.read" value={t("common.number", { value: minifluxData.read })} />
    </Container>
  );
}
