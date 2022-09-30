import { useTranslation } from "next-i18next";

import Container from "components/services/widget/container";
import Block from "components/services/widget/block";
import useWidgetAPI from "utils/proxy/use-widget-api";

export default function Component({ service }) {
  const { t } = useTranslation();

  const { widget } = service;

  const { data: statsData, error: statsError } = useWidgetAPI(widget, "instance");

  if (statsError) {
    return <Container error={t("widget.api_error")} />;
  }

  if (!statsData) {
    return (
      <Container service={service}>
        <Block label="mastodon.user_count" />
        <Block label="mastodon.status_count" />
        <Block label="mastodon.domain_count" />
      </Container>
    );
  }

  return (
    <Container service={service}>
      <Block label="mastodon.user_count" value={t("common.number", { value: statsData.stats.user_count })} />
      <Block label="mastodon.status_count" value={t("common.number", { value: statsData.stats.status_count })} />
      <Block label="mastodon.domain_count" value={t("common.number", { value: statsData.stats.domain_count })} />
    </Container>
  );
}
