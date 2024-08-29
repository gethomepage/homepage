import { useTranslation } from "next-i18next";

import Container from "components/services/widget/container";
import Block from "components/services/widget/block";
import useWidgetAPI from "utils/proxy/use-widget-api";

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

  if (!zabbixData) {
    return (
      <Container service={service}>
        <Block label="zabbix.warning" />
        <Block label="zabbix.average" />
        <Block label="zabbix.high" />
        <Block label="zabbix.disaster" />
      </Container>
    );
  }

  const warning = zabbixData.filter((item) => item.priority === PriorityWarning).length;
  const average = zabbixData.filter((item) => item.priority === PriorityAverage).length;
  const high = zabbixData.filter((item) => item.priority === PriorityHigh).length;
  const disaster = zabbixData.filter((item) => item.priority === PriorityDisaster).length;

  return (
    <Container service={service}>
      <Block label="zabbix.warning" value={t("common.number", { value: warning })} />
      <Block label="zabbix.average" value={t("common.number", { value: average })} />
      <Block label="zabbix.high" value={t("common.number", { value: high })} />
      <Block label="zabbix.disaster" value={t("common.number", { value: disaster })} />
    </Container>
  );
}
