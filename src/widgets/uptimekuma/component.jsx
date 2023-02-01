import { useTranslation } from "next-i18next";

import Container from "components/services/widget/container";
import useWidgetAPI from "utils/proxy/use-widget-api";
import Block from "components/services/widget/block";

const Status = {
  good: "uptimekuma.good",
  warn: "uptimekuma.warn",
  bad: "uptimekuma.bad",
  unknown: "uptimekuma.unknown",
};

export default function Component({ service }) {
  const { t } = useTranslation();

  const { widget } = service;

  const { data: statusData, error: statusError } = useWidgetAPI(widget);

  if (statusError) {
    return <Container error={statusError} />;
  }

  if (!statusData) {
    return (
      <Container service={service}>
        <Block label="uptimekuma.status"/>
        <Block label="uptimekuma.uptime"/>
      </Container>
    );
  }

  if (statusData.icon) {
    // eslint-disable-next-line no-param-reassign
    service.icon = statusData.icon;
  }

  return (
    <Container service={service}>
      <Block label="uptimekuma.status" value={statusData.incident ? statusData.incident : t(Status[statusData.message])} />
      <Block label="uptimekuma.uptime" value={t("common.number", { value: statusData.uptime, decimals: 1 })} />
    </Container>
  );
}
