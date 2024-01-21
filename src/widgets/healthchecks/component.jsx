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

  if (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()
  ) {
    dateOptions = { timeStyle: "short" };
  }

  return new Intl.DateTimeFormat(i18n.language, dateOptions).format(date);
}

function countStatus(data) {
  let upCount = 0;
  let downCount = 0;

  if (data.checks) {
    data.checks.forEach((check) => {
      if (check.status === "up") {
        upCount += 1;
      } else if (check.status === "down") {
        downCount += 1;
      }
    });
  }

  return { upCount, downCount };
}

export default function Component({ service }) {
  const { t } = useTranslation();
  const { widget } = service;

  const { data, error } = useWidgetAPI(widget, "checks");

  if (error) {
    return <Container service={service} error={error} />;
  }

  if (!data) {
    return (
      <Container service={service}>
        <Block label="healthchecks.status" />
        <Block label="healthchecks.last_ping" />
      </Container>
    );
  }

  const hasUuid = widget?.uuid;

  const { upCount, downCount } = countStatus(data);

  return (
    <Container service={service}>
      {hasUuid ? (
        <>
          <Block label="healthchecks.status" value={t(`healthchecks.${data.status}`)} />
          <Block
            label="healthchecks.last_ping"
            value={data.last_ping ? formatDate(data.last_ping) : t("healthchecks.never")}
          />
        </>
      ) : (
        <>
          <Block label="healthchecks.up" value={upCount} />
          <Block label="healthchecks.down" value={downCount} />
        </>
      )}
    </Container>
  );
}
