import Block from "components/services/widget/block";
import Container from "components/services/widget/container";
import { useTranslation } from "next-i18next";

import useWidgetAPI from "utils/proxy/use-widget-api";

export default function Component({ service }) {
  const { t } = useTranslation();
  const { widget } = service;

  const { version = 3 } = widget;

  const alertsEndpointMap = {
    1: "alerts",
    2: "alertmanager",
    3: "grafana",
  };
  const alertsEndpoint = alertsEndpointMap[version] || alertsEndpointMap[3];

  const { data: statsData, error: statsError } = useWidgetAPI(widget, "stats");
  const { data: alertsData, error: alertsError } = useWidgetAPI(widget, alertsEndpoint);

  let alertsInt = 0;
  if (alertsData) {
    if (version === 1) {
      alertsInt = alertsData.filter((a) => a.state === "alerting").length;
    } else {
      alertsInt = alertsData.length;
    }
  }

  if (statsError || alertsError) {
    return <Container service={service} error={statsError ?? alertsError} />;
  }

  if (!statsData || !alertsData) {
    return (
      <Container service={service}>
        <Block label="grafana.dashboards" />
        <Block label="grafana.datasources" />
        <Block label="grafana.totalalerts" />
        <Block label="grafana.alertstriggered" />
      </Container>
    );
  }

  return (
    <Container service={service}>
      <Block label="grafana.dashboards" value={t("common.number", { value: statsData.dashboards })} />
      <Block label="grafana.datasources" value={t("common.number", { value: statsData.datasources })} />
      <Block label="grafana.totalalerts" value={t("common.number", { value: statsData.alerts })} />
      <Block label="grafana.alertstriggered" value={t("common.number", { value: alertsInt })} />
    </Container>
  );
}
