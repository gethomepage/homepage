import { useTranslation } from "next-i18next";

import Container from "components/services/widget/container";
import Block from "components/services/widget/block";
import useWidgetAPI from "utils/proxy/use-widget-api";

const formatUptime = (timestamp) => {
  const hours = Math.floor(timestamp / 3600);
  const minutes = Math.floor((timestamp % 3600) / 60);
  const seconds = timestamp % 60;

  const hourDuration = hours > 0 ? `${hours}h` : "00h";
  const minDuration = minutes > 0 ? `${minutes}m` : "00m";
  const secDuration = seconds > 0 ? `${seconds}s` : "00s";

  return hourDuration + minDuration + secDuration;
};

export default function Component({ service }) {
  const { t } = useTranslation();
  const { widget } = service;
  const { data: fritzboxData, error: fritzboxError } = useWidgetAPI(widget, "status");

  if (fritzboxError) {
    return <Container service={service} error={fritzboxError} />;
  }

  // Default fields
  if (!widget.fields?.length > 0) {
    widget.fields = ["connectionStatus", "uptime", "maxDown", "maxUp"];
  }
  const MAX_ALLOWED_FIELDS = 4;
  // Limits max number of displayed fields
  if (widget.fields?.length > MAX_ALLOWED_FIELDS) {
    widget.fields = widget.fields.slice(0, MAX_ALLOWED_FIELDS);
  }

  if (!fritzboxData) {
    return (
      <Container service={service}>
        <Block label="fritzbox.connectionStatus" />
        <Block label="fritzbox.uptime" />
        <Block label="fritzbox.maxDown" />
        <Block label="fritzbox.maxUp" />
        <Block label="fritzbox.down" />
        <Block label="fritzbox.up" />
        <Block label="fritzbox.received" />
        <Block label="fritzbox.sent" />
        <Block label="fritzbox.externalIPAddress" />
      </Container>
    );
  }

  return (
    <Container service={service}>
      <Block label="fritzbox.connectionStatus" value={t(`fritzbox.connectionStatus${fritzboxData.connectionStatus}`)} />
      <Block label="fritzbox.uptime" value={formatUptime(fritzboxData.uptime)} />
      <Block label="fritzbox.maxDown" value={t("common.byterate", { value: fritzboxData.maxDown / 8, decimals: 1 })} />
      <Block label="fritzbox.maxUp" value={t("common.byterate", { value: fritzboxData.maxUp / 8, decimals: 1 })} />
      <Block label="fritzbox.down" value={t("common.byterate", { value: fritzboxData.down, decimals: 1 })} />
      <Block label="fritzbox.up" value={t("common.byterate", { value: fritzboxData.up, decimals: 1 })} />
      <Block label="fritzbox.received" value={t("common.bytes", { value: fritzboxData.received })} />
      <Block label="fritzbox.sent" value={t("common.bytes", { value: fritzboxData.sent })} />
      <Block label="fritzbox.externalIPAddress" value={fritzboxData.externalIPAddress} />
    </Container>
  );
}
