
import Container from "components/services/widget/container";
import Block from "components/services/widget/block";
import useWidgetAPI from "utils/proxy/use-widget-api";
// import { useTranslation } from "next-i18next";

export default function Component({ service }) {
  // const { t } = useTranslation();

  const { widget } = service;

  const { data: performanceToday, error: ghostfolioErrorToday } = useWidgetAPI(widget, "today");
  const { data: performanceYtd, error: ghostfolioErrorYtd } = useWidgetAPI(widget, "ytd", { refreshInterval: 36000 });
  const { data: performanceYear, error: ghostfolioErrorYear } = useWidgetAPI(widget, "year", { refreshInterval: 36000 });
  const { data: performanceMax, error: ghostfolioErrorMax } = useWidgetAPI(widget, "max", { refreshInterval: 36000 });

  if (ghostfolioErrorToday) {
    return <Container error={ghostfolioErrorToday} />;
  }

  if (ghostfolioErrorYtd) {
    return <Container error={ghostfolioErrorYtd} />;
  }

  if (ghostfolioErrorYear) {
    return <Container error={ghostfolioErrorYear} />;
  }

  if (ghostfolioErrorMax) {
    return <Container error={ghostfolioErrorMax} />;
  }

  return (
    <Container service={service}>
      {/* <Block label="ghostfolio.gross_percent_today" value={performanceToday && t("common.percent", { value: Math.round(performanceToday.performance.currentGrossPerformancePercent * 10000) / 100 }) || false} />
      <Block label="ghostfolio.gross_percent_ytd" value={performanceYtd && t("common.percent", { value: Math.round(performanceYtd.performance.currentGrossPerformancePercent * 10000) / 100 }) || false} />
      <Block label="ghostfolio.gross_percent_1y" value={performanceYear && t("common.percent", { value: Math.round(performanceYear.performance.currentGrossPerformancePercent * 10000) / 100 }) || false} />
      <Block label="ghostfolio.gross_percent_max" value={performanceMax && t("common.percent", { value: Math.round(performanceMax.performance.currentGrossPerformancePercent * 10000) / 100 }) || false} /> */}
      <Block label="ghostfolio.gross_percent_today" value={performanceToday && `${(performanceToday.performance.currentGrossPerformancePercent > 0 ? "+" : "")}${(Math.round(performanceToday.performance.currentGrossPerformancePercent * 10000) / 100)}%` || false} />
      <Block label="ghostfolio.gross_percent_ytd" value={performanceYtd && `${(performanceYtd.performance.currentGrossPerformancePercent > 0 ? "+" : "")}${(Math.round(performanceYtd.performance.currentGrossPerformancePercent * 10000) / 100)}%` || false} />
      <Block label="ghostfolio.gross_percent_1y" value={performanceYear && `${(performanceYear.performance.currentGrossPerformancePercent > 0 ? "+" : "")}${(Math.round(performanceYear.performance.currentGrossPerformancePercent * 10000) / 100)}%` || false} />
      <Block label="ghostfolio.gross_percent_max" value={performanceMax && `${(performanceMax.performance.currentGrossPerformancePercent > 0 ? "+" : "")}${(Math.round(performanceMax.performance.currentGrossPerformancePercent * 10000) / 100)}%` || false} />
    </Container>
  );
}
