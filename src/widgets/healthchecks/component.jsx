import { useTranslation } from "next-i18next";

import { i18n } from "../../../next-i18next.config";

import Block from "components/services/widget/block";
import Container from "components/services/widget/container";
import useWidgetAPI from "utils/proxy/use-widget-api";

function formatDate(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  let dateOptions = {
    month: "numeric",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
  };
  
  if (date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth() && date.getDate() === now.getDate()) {
    dateOptions = { timeStyle: "short" };
  }
  
  return new Intl.DateTimeFormat(i18n.language, dateOptions).format(date);
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
