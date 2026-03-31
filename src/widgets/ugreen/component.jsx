import Block from "components/services/widget/block";
import Container from "components/services/widget/container";
import { useTranslation } from "next-i18next";

import useWidgetAPI from "utils/proxy/use-widget-api";

const DEFAULT_FIELDS = ["cpu", "mem", "uptime", "cpuTemp"];
const MAX_ALLOWED_FIELDS = 4;

export default function Component({ service }) {
  const { t } = useTranslation();

  const { widget } = service;

  if (!widget.fields?.length) {
    widget.fields = DEFAULT_FIELDS;
  } else if (widget.fields.length > MAX_ALLOWED_FIELDS) {
    widget.fields = widget.fields.slice(0, MAX_ALLOWED_FIELDS);
  }

  const { data: statsData, error: statsError } = useWidgetAPI(widget, "stats");
  const { data: statusData, error: statusError } = useWidgetAPI(widget, "status");

  if (statsError || statusError) {
    const finalError = statsError ?? statusError;
    return <Container service={service} error={finalError} />;
  }

  if (!statsData || !statusData) {
    return (
      <Container service={service}>
        <Block label="ugreen.cpu" />
        <Block label="ugreen.mem" />
        <Block label="ugreen.uptime" />
        <Block label="ugreen.cpuTemp" />
        <Block label="ugreen.netRx" />
        <Block label="ugreen.netTx" />
        <Block label="ugreen.fanSpeed" />
        <Block label="ugreen.diskRead" />
        <Block label="ugreen.diskWrite" />
      </Container>
    );
  }

  return (
    <Container service={service}>
      <Block label="ugreen.cpu" value={t("common.percent", { value: statsData.cpu })} />
      <Block label="ugreen.mem" value={t("common.percent", { value: statsData.mem })} />
      <Block label="ugreen.uptime" value={t("common.duration", { value: statusData.uptime })} />
      <Block label="ugreen.cpuTemp" value={`${t("common.number", { value: statsData.cpuTemp })} °C`} />
      <Block label="ugreen.netRx" value={t("common.byterate", { value: statsData.netRx })} />
      <Block label="ugreen.netTx" value={t("common.byterate", { value: statsData.netTx })} />
      <Block label="ugreen.fanSpeed" value={`${t("common.number", { value: statsData.cpuFan })} RPM`} />
      <Block label="ugreen.diskRead" value={t("common.byterate", { value: statsData.diskRead })} />
      <Block label="ugreen.diskWrite" value={t("common.byterate", { value: statsData.diskWrite })} />
    </Container>
  );
}
