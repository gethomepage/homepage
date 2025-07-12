import Block from "components/services/widget/block";
import Container from "components/services/widget/container";
import { useTranslation } from "next-i18next";

import useWidgetAPI from "utils/proxy/use-widget-api";

export default function Component({ service }) {
  const { t } = useTranslation();
  const { widget } = service;

  const { version = 1, alerts = "grafana" } = widget;

  const { data: statsData, error: statsError } = useWidgetAPI(widget, "stats");

  let primaryAlertsEndpoint = "alerts";
  let secondaryAlertsEndpoint = "grafana";
  if (version === 2) {
    primaryAlertsEndpoint = alerts;
    secondaryAlertsEndpoint = "";
  }

  const { data: primaryAlertsData, error: primaryAlertsError } = useWidgetAPI(widget, primaryAlertsEndpoint);
  const { data: secondaryAlertsData, error: secondaryAlertsError } = useWidgetAPI(widget, secondaryAlertsEndpoint);

  let alertsInt = 0;
  let alertsError = null;
  if (version === 1) {
    if (primaryAlertsError || !primaryAlertsData || primaryAlertsData.length === 0) {
      if (secondaryAlertsData) {
        alertsInt = secondaryAlertsData.length;
      }
    } else {
      alertsInt = primaryAlertsData.filter((a) => a.state === "alerting").length;
    }

    if (primaryAlertsError && secondaryAlertsError) {
      alertsError = primaryAlertsError ?? secondaryAlertsError;
    }
  } else if (version === 2) {
    if (primaryAlertsData) {
      alertsInt = primaryAlertsData.length;
    }

    if (primaryAlertsError) {
      alertsError = primaryAlertsError;
    }
  }

  if (statsError || alertsError) {
    return <Container service={service} error={statsError ?? alertsError} />;
  }

  if (!statsData) {
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
