import { useTranslation } from "next-i18next";

import Container from "components/services/widget/container";
import Block from "components/services/widget/block";
import useWidgetAPI from "utils/proxy/use-widget-api";

export default function Component({ service }) {
  const { t } = useTranslation();

  const { widget } = service;

  const { data: freshrssData, error: freshrssError } = useWidgetAPI(widget, "info");

  if (freshrssError) {
    return <Container service={service} error={freshrssError} />;
  }

  if (!freshrssData) {
    return (
      <Container service={service}>
        <Block label="freshrss.unread" />
        <Block label="freshrss.subscriptions" />
      </Container>
    );
  }

  return (
    <Container service={service}>
      <Block label="freshrss.unread" value={t("common.number", { value: freshrssData.unread })} />
      <Block label="freshrss.subscriptions" value={t("common.number", { value: freshrssData.subscriptions })} />
    </Container>
  );
}
