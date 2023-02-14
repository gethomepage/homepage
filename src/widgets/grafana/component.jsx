import { useTranslation } from "next-i18next";

import Container from "components/services/widget/container";
import Block from "components/services/widget/block";
import useWidgetAPI from "utils/proxy/use-widget-api";

export default function Component({ service }) {
  const { t } = useTranslation();

  const { widget } = service;
  const { data: alertsData, error: alertsError } = useWidgetAPI(widget, "alerts");

  if (alertsError) {
    return <Container error={alertsError} />;
  }

  if (!alertsData) {
    return (
      <Container service={service}>
        <Block label="grafana.totalalerts" />
        <Block label="grafana.alertstriggered" />
      </Container>
    );
  }

  return (
    <Container service={service}>
      <Block label="grafana.totalalerts" value={t("common.number", { value: alertsData.length })} />
      <Block label="grafana.alertstriggered" value={t("common.number", { value: alertsData.filter(a => a.state === "alerting").length })} />
    </Container>
  );
}
