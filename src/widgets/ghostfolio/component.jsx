import { useTranslation } from "next-i18next";

import Container from "components/services/widget/container";
import Block from "components/services/widget/block";
import useWidgetAPI from "utils/proxy/use-widget-api";

function getPerformancePercent(t, performanceRange) {
  // ghostfolio v2.79.0 changed to grossPerformancePercentage
  // ghostfolio v2.106.0 changed to netPerformancePercentageWithCurrencyEffect
  const percent =
    performanceRange.performance.netPerformancePercentageWithCurrencyEffect ??
    performanceRange.performance.grossPerformancePercentage ??
    performanceRange.performance.currentGrossPerformancePercent;
  return `${percent > 0 ? "+" : ""}${t("common.percent", {
    value: percent * 100,
    maximumFractionDigits: 2,
  })}`;
}

export default function Component({ service }) {
  const { t } = useTranslation();
  const { widget } = service;

  const { data: performanceToday, error: ghostfolioErrorToday } = useWidgetAPI(widget, "today");
  const { data: performanceYear, error: ghostfolioErrorYear } = useWidgetAPI(widget, "year");
  const { data: performanceMax, error: ghostfolioErrorMax } = useWidgetAPI(widget, "max");

  if (ghostfolioErrorToday || ghostfolioErrorYear || ghostfolioErrorMax) {
    const finalError = ghostfolioErrorToday ?? ghostfolioErrorYear ?? ghostfolioErrorMax;
    return <Container service={service} error={finalError} />;
  }

  if (performanceToday?.statusCode === 401) {
    return <Container service={service} error={performanceToday} />;
  }

  if (!performanceToday || !performanceYear || !performanceMax) {
    return (
      <Container service={service}>
        <Block label="ghostfolio.gross_percent_today" />
        <Block label="ghostfolio.gross_percent_1y" />
        <Block label="ghostfolio.gross_percent_max" />
      </Container>
    );
  }

  return (
    <Container service={service}>
      <Block label="ghostfolio.gross_percent_today" value={getPerformancePercent(t, performanceToday)} />
      <Block label="ghostfolio.gross_percent_1y" value={getPerformancePercent(t, performanceYear)} />
      <Block label="ghostfolio.gross_percent_max" value={getPerformancePercent(t, performanceMax)} />
    </Container>
  );
}
