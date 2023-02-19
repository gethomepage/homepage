import { useTranslation } from "next-i18next";

import Block from "components/services/widget/block";
import Container from "components/services/widget/container";
import useWidgetAPI from "utils/proxy/use-widget-api";

function formatDate(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const diff = (now - date) / 1000;

  if (date > today && diff < 86400) {
    return date.toLocaleTimeString([], {
      hour: "numeric",
      minute: "numeric",
    });
  }

  return date.toLocaleDateString([], {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
  });
}

export default function Component({ service }) {
  const { t } = useTranslation();
  const { widget } = service;

  const { data, error } = useWidgetAPI(widget, "checks");

  if (error) {
    return <Container error={error} />;
  }

  if (!data) {
    return (
      <Container service={service}>
        <Block label={t("healthchecks.status")} />
        <Block label={t("healthchecks.last_ping")} />
      </Container>
    );
  }

  return (
    <Container service={service}>
      <Block label={t("healthchecks.status")} value={t(`healthchecks.${data.status}`)} />
      <Block
        label={t("healthchecks.last_ping")}
        value={data.last_ping ? formatDate(data.last_ping) : t("healthchecks.never")}
      />
    </Container>
  );
}
