import { useTranslation } from "next-i18next";

import Container from "components/services/widget/container";
import Block from "components/services/widget/block";
import useWidgetAPI from "utils/proxy/use-widget-api";

export default function Component({ service }) {
  const { t } = useTranslation();

  const { widget } = service;
  const { data: statsData, error: statsError } = useWidgetAPI(widget, "stats");
  const { data: alertsData, error: alertsError } = useWidgetAPI(widget, "alerts");
  const { data: alertmanagerData, error: alertmanagerError } = useWidgetAPI(widget, "alertmanager");

  if (statsError || alertsError || alertmanagerError) {
    return <Container service={service} error={statsError ?? alertsError} />;
  }

  if (!statsData || !alertsData || !alertmanagerData) {
    return (
      <Container service={service}>
        <Block label="grafana.dashboards" />
        <Block label="grafana.datasources" />
        <Block label="grafana.totalalerts" />
        <Block label="grafana.alertstriggered" />
        <Block label="grafana.alertmanager" />
      </Container>
    );
  }

  return (
    <Container service={service}>
      <Block label="grafana.dashboards" value={t("common.number", { value: statsData.dashboards })} />
      <Block label="grafana.datasources" value={t("common.number", { value: statsData.datasources })} />
      <Block label="grafana.totalalerts" value={t("common.number", { value: statsData.alerts })} />
      <Block
        label="grafana.alertstriggered"
        value={t("common.number", { value: alertsData.filter((a) => a.state === "alerting").length })}
      />
      <Block
        label="grafana.alertmanager"
        value={t("common.number", { value: alertmanagerData.length })}
      />
    </Container>
  );
}
