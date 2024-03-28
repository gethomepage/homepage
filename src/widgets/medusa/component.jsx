import { useTranslation } from "next-i18next";

import Container from "components/services/widget/container";
import Block from "components/services/widget/block";
import useWidgetAPI from "utils/proxy/use-widget-api";

export default function Component({ service }) {
  const { t } = useTranslation();
  const { widget } = service;

  const { data: statsData, error: statsError } = useWidgetAPI(widget, "stats");
  const { data: futureData, error: futureError } = useWidgetAPI(widget, "future");

  if (statsError || futureError) {
    const finalError = statsError ?? futureError;
    return <Container service={service} error={finalError} />;
  }

  if (!statsData || !futureData) {
    return (
      <Container service={service}>
        <Block label="medusa.wanted" />
        <Block label="medusa.queued" />
        <Block label="medusa.series" />
      </Container>
    );
  }

  const { later, missed, soon, today } = futureData.data;
  const future = later.length + missed.length + soon.length + today.length;

  return (
    <Container service={service}>
      <Block label="medusa.wanted" value={t("common.number", { value: future })} />
      <Block label="medusa.queued" value={t("common.number", { value: statsData.data.ep_snatched })} />
      <Block label="medusa.series" value={t("common.number", { value: statsData.data.shows_active })} />
    </Container>
  );
}
