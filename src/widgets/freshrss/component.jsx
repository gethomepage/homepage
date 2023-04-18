import { useTranslation } from "next-i18next";

import Container from "components/services/widget/container";
import Block from "components/services/widget/block";
import useWidgetAPI from "utils/proxy/use-widget-api";

export default function Component({ service }) {
  const { t } = useTranslation();

  const { widget } = service;

  const { data: subscriptionsData, error: subscriptionsError } = useWidgetAPI(widget, "subscriptions");
  const { data: unreadData, error: unreadError } = useWidgetAPI(widget, "unread");

  if (subscriptionsError) {
    return <Container error={subscriptionsError} />;
  }
  if (unreadError) {
    return <Container error={unreadError} />;
  }

  if (!subscriptionsData || !unreadData) {
    return (
      <Container service={service}>
        <Block label="freshrss.unread" />
        <Block label="freshrss.subscriptions" />
      </Container>
    );
  }

  return (
    <Container service={service}>
      <Block label="freshrss.unread" value={t("common.number", { value: unreadData.count })} />
      <Block label="freshrss.subscriptions" value={t("common.number", { value: subscriptionsData.count })} />
    </Container>
  );
}
