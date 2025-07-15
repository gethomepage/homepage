import Block from "components/services/widget/block";
import Container from "components/services/widget/container";
import { useTranslation } from "next-i18next";

import useWidgetAPI from "utils/proxy/use-widget-api";

export default function Component({ service }) {
  const { t } = useTranslation();
  const { widget } = service;

  const { data: overview, error: overviewError } = useWidgetAPI(widget, "overview");

  if (overviewError) {
    return <Container service={service} error={overviewError} />;
  }

  if (!overview) {
    return (
      <Container service={service}>
        <Block label="tradetally.total_pnl" />
        <Block label="tradetally.win_rate" />
        <Block label="tradetally.total_trades" />
        <Block label="tradetally.total_executions" />
      </Container>
    );
  }

  // Handle case where overview might be an error response
  if (overview.error || overview.statusCode === 401) {
    return <Container service={service} error={overview} />;
  }

  // Extract data from overview response - TradeTally API returns { overview: {...} }
  const stats = overview.overview || overview;

  // Calculate today's trades count - TradeTally doesn't provide individual trades in overview
  // This would require a separate API call, so we'll show total trades instead for now
  const totalTrades = stats.total_trades || 0;

  // TradeTally doesn't provide open positions in overview endpoint
  // We'll show total executions as a proxy
  const totalExecutions = stats.total_executions || 0;

  // Extract total P&L from the overview response
  const totalPnL = parseFloat(stats.total_pnl) || 0;

  // Extract win rate from the overview response (already calculated as percentage)
  const winRate = parseFloat(stats.win_rate) || 0;

  // Format P&L with color
  const pnlColor = totalPnL >= 0 ? "text-emerald-300" : "text-rose-300";
  const formattedPnL = (
    <span className={pnlColor}>
      {totalPnL >= 0 ? "+" : ""}
      {t("common.number", {
        value: totalPnL,
        style: "currency",
        currency: "USD",
      })}
    </span>
  );

  // Format win rate with color
  const winRateColor = winRate >= 50 ? "text-emerald-300" : "text-rose-300";
  const formattedWinRate = (
    <span className={winRateColor}>
      {t("common.percent", {
        value: winRate,
        maximumFractionDigits: 1,
      })}
    </span>
  );

  return (
    <Container service={service}>
      <Block label="tradetally.total_pnl" value={formattedPnL} />
      <Block label="tradetally.win_rate" value={formattedWinRate} />
      <Block label="tradetally.total_trades" value={t("common.number", { value: totalTrades })} />
      <Block label="tradetally.total_executions" value={t("common.number", { value: totalExecutions })} />
    </Container>
  );
}