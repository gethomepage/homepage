import Block from "components/services/widget/block";
import Container from "components/services/widget/container";
import { useTranslation } from "next-i18next";

import useWidgetAPI from "utils/proxy/use-widget-api";

export default function Component({ service }) {
  const { t } = useTranslation();
  const { widget } = service;

  const { version = 1, alerts = "grafana" } = widget;

  const { data: statsData, error: statsError } = useWidgetAPI(widget, "stats");

  let alertsInt = 0;
  let fetchError = null;
  if (version === 1) {
    const { data: alertsData, error: alertsError } = useWidgetAPI(widget, "alerts");
    const { data: grafanaData, error: grafanaError } = useWidgetAPI(widget, "grafana");

    if (alertsError || !alertsData || alertsData.length === 0) {
      if (grafanaData) {
        alertsInt = grafanaData.length;
      }
    } else {
      alertsInt = alertsData.filter((a) => a.state === "alerting").length;
    }

    if (statsError || (alertsError && grafanaError)) {
      fetchError = statsError ?? alertsError ?? grafanaError;
    }
  } else if (version === 2) {
    const allowedEndpoints = ["alertmanager", "grafana"];
    if (!allowedEndpoints.includes(alerts)) {
      fetchError = new Error(
        `Invalid alerts endpoint: ${alerts}, allowed endpoints are: ${allowedEndpoints.join(", ")}`,
      );
    } else {
      const { data: alertsData, error: alertsError } = useWidgetAPI(widget, alerts);

      if (alertsData) {
        alertsInt = alertsData.length;
      }

      if (statsError || alertsError) {
        fetchError = statsError ?? alertsError;
      }
    }
  }

  if (fetchError) {
    return <Container service={service} error={fetchError} />;
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
