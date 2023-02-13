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

  const totalAlerts = Object.keys(alertsData).length;
  let alertsTriggered = 0;
  Object.keys(alertsData).forEach((key) => {
    if (alertsData[key].state === "alerting") {
      alertsTriggered += 1;
    }
  });

  return (
    <Container service={service}>
      <Block label="total alerts" value={t("common.number", { value: totalAlerts })} />
      <Block label="alerts triggered" value={t("common.number", { value: alertsTriggered })} />
    </Container>
  );
}
