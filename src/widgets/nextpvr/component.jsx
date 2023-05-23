import { useTranslation } from "next-i18next";

import Block from "components/services/widget/block";
import Container from "components/services/widget/container";
import useWidgetAPI from "utils/proxy/use-widget-api";

export default function Component({ service }) {
  const { t } = useTranslation();

  const { widget } = service;

  const { data: nextpvrData, error: nextpvrAPIError } = useWidgetAPI(widget, "unified", {
    refreshInterval: 5000,
  });

  if (nextpvrAPIError) {
    return <Container service={service} error={nextpvrAPIError} />;
  }

  if (!nextpvrData) {
    return (
      <Container service={service}>
        <Block label="nextpvr.upcoming" />
        <Block label="nextpvr.ready" />
      </Container>
    );
  }

  return (
    <Container service={service}>
      <Block label="nextpvr.upcoming" value={t("common.number", { value: nextpvrData.recordingCount })} />
      <Block label="nextpvr.ready" value={t("common.number", { value: nextpvrData.readyCount })} />
    </Container>
  );
}
