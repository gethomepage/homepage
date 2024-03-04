import { useTranslation } from "next-i18next";

import Container from "components/services/widget/container";
import Block from "components/services/widget/block";
import useWidgetAPI from "utils/proxy/use-widget-api";

export default function Component({ service }) {
  const { t } = useTranslation();

  const { widget } = service;

  const { data: piholeData, error: piholeError } = useWidgetAPI(widget, "summaryRaw");

  if (piholeError) {
    return <Container service={service} error={piholeError} />;
  }

  if (!widget.fields) {
    widget.fields = ["queries", "blocked", "gravity"];
  }

  if (!piholeData) {
    return (
      <Container service={service}>
        <Block label="pihole.queries" />
        <Block label="pihole.blocked" />
        <Block label="pihole.blocked_percent" />
        <Block label="pihole.gravity" />
      </Container>
    );
  }

  let blockedValue = `${t("common.number", { value: parseInt(piholeData.ads_blocked_today, 10) })}`;
  if (!widget.fields.includes("blocked_percent")) {
    blockedValue += ` (${t("common.percent", { value: parseFloat(piholeData.ads_percentage_today.toPrecision(3)) })})`;
  }

  return (
    <Container service={service}>
      <Block label="pihole.queries" value={t("common.number", { value: parseInt(piholeData.dns_queries_today, 10) })} />
      <Block label="pihole.blocked" value={blockedValue} />
      <Block
        label="pihole.blocked_percent"
        value={t("common.percent", { value: parseFloat(piholeData.ads_percentage_today.toPrecision(3)) })}
      />
      <Block
        label="pihole.gravity"
        value={t("common.number", { value: parseInt(piholeData.domains_being_blocked, 10) })}
      />
    </Container>
  );
}
