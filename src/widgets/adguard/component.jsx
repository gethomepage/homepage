import { useTranslation } from "next-i18next";

import Container from "components/services/widget/container";
import Block from "components/services/widget/block";
import useWidgetAPI from "utils/proxy/use-widget-api";

export default function Component({ service }) {
  const { t } = useTranslation();

  const { widget } = service;

  const { data: adguardData, error: adguardError } = useWidgetAPI(widget, "stats");

  if (adguardError) {
    return <Container error={t("widget.api_error")} />;
  }

  if (!adguardData) {
    return (
      <Container service={service}>
        <Block label="adguard.queries" />
        <Block label="adguard.blocked" />
        <Block label="adguard.filtered" />
        <Block label="adguard.latency" />
      </Container>
    );
  }

  const filtered =
    adguardData.num_replaced_safebrowsing + adguardData.num_replaced_safesearch + adguardData.num_replaced_parental;

  return (
    <Container service={service}>
      <Block label="adguard.queries" value={t("common.number", { value: adguardData.num_dns_queries })} />
      <Block label="adguard.blocked" value={t("common.number", { value: adguardData.num_blocked_filtering })} />
      <Block label="adguard.filtered" value={t("common.number", { value: filtered })} />
      <Block
        label="adguard.latency"
        value={t("common.ms", { value: adguardData.avg_processing_time * 1000, style: "unit", unit: "millisecond" })}
      />
    </Container>
  );
}
