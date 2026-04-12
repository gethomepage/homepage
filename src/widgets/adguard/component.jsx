import Block from "components/services/widget/block";
import Container from "components/services/widget/container";
import { useTranslation } from "next-i18next";

import useWidgetAPI from "utils/proxy/use-widget-api";

export default function Component({ service }) {
  const { t } = useTranslation();

  const { widget } = service;
  const { abbreviate } = widget;

  const { data: adguardData, error: adguardError } = useWidgetAPI(widget, "stats");

  if (adguardError) {
    return <Container service={service} error={adguardError} />;
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

  const formatNumber = (value) => {
    if (abbreviate) {
      return new Intl.NumberFormat(undefined, {
        notation: "compact",
        maximumFractionDigits: 1,
      }).format(value);
    }
    return t("common.number", { value });
  };

  return (
    <Container service={service}>
      <Block label="adguard.queries" value={formatNumber(adguardData.num_dns_queries)} />
      <Block label="adguard.blocked" value={formatNumber(adguardData.num_blocked_filtering)} />
      <Block label="adguard.filtered" value={formatNumber(filtered)} />
      <Block
        label="adguard.latency"
        value={
          abbreviate
            ? `${Math.round(adguardData.avg_processing_time * 1000)} ms`
            : t("common.ms", { value: adguardData.avg_processing_time * 1000, style: "unit", unit: "millisecond" })
        }
        highlightValue={adguardData.avg_processing_time * 1000}
      />
    </Container>
  );
}
