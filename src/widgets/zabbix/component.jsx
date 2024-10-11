import { useTranslation } from "next-i18next";

import Container from "components/services/widget/container";
import Block from "components/services/widget/block";
import useWidgetAPI from "utils/proxy/use-widget-api";

const PriorityUnclassified = "0";
const PriorityInformation = "1";
const PriorityWarning = "2";
const PriorityAverage = "3";
const PriorityHigh = "4";
const PriorityDisaster = "5";

export default function Component({ service }) {
  const { t } = useTranslation();
  const { widget } = service;

  const { data: zabbixData, error: zabbixError } = useWidgetAPI(widget, "trigger");

  if (zabbixError) {
    return <Container service={service} error={zabbixError} />;
  }

  if (!widget.fields) {
    widget.fields = ["warning", "average", "high", "disaster"];
  } else if (widget.fields?.length > 4) {
    widget.fields = widget.fields.slice(0, 4);
  }

  if (!zabbixData) {
    return (
      <Container service={service}>
        <Block label="zabbix.unclassified" />
        <Block label="zabbix.information" />
        <Block label="zabbix.warning" />
        <Block label="zabbix.average" />
        <Block label="zabbix.high" />
        <Block label="zabbix.disaster" />
      </Container>
    );
  }

  const unclassified = zabbixData.filter((item) => item.priority === PriorityUnclassified).length;
  const information = zabbixData.filter((item) => item.priority === PriorityInformation).length;
  const warning = zabbixData.filter((item) => item.priority === PriorityWarning).length;
  const average = zabbixData.filter((item) => item.priority === PriorityAverage).length;
  const high = zabbixData.filter((item) => item.priority === PriorityHigh).length;
  const disaster = zabbixData.filter((item) => item.priority === PriorityDisaster).length;

  return (
    <Container service={service}>
      <Block label="zabbix.unclassified" value={t("common.number", { value: unclassified })} />
      <Block label="zabbix.information" value={t("common.number", { value: information })} />
      <Block label="zabbix.warning" value={t("common.number", { value: warning })} />
      <Block label="zabbix.average" value={t("common.number", { value: average })} />
      <Block label="zabbix.high" value={t("common.number", { value: high })} />
      <Block label="zabbix.disaster" value={t("common.number", { value: disaster })} />
    </Container>
  );
}
