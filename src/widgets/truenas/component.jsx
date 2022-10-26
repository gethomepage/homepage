import { useTranslation } from "next-i18next";

import Container from "components/services/widget/container";
import Block from "components/services/widget/block";
import useWidgetAPI from "utils/proxy/use-widget-api";

export default function Component({ service }) {
  const { t } = useTranslation();

  const { widget } = service;

  const { data: alertData, error: alertError } = useWidgetAPI(widget, "alerts");
  const { data: statusData, error: statusError } = useWidgetAPI(widget, "status");

  if (alertError || statusError) {
    return <Container error={t("widget.api_error")} />;
  }

  if (!alertData || !statusData) {
    return (
      <Container service={service}>
        <Block label="truenas.load" />
        <Block label="truenas.uptime" />
        <Block label="truenas.alerts" />
      </Container>
    );
  }

  return (
    <Container service={service}>
      <Block label="truenas.load" value={t("common.number", { value: statusData.loadavg[0] })} />
      <Block label="truenas.uptime" value={statusData.uptime.substring(0,statusData.uptime.length-7)} />
      <Block label="truenas.alerts" value={t("common.number", { value: alertData.pending })} />
     
    </Container>
  );
}
