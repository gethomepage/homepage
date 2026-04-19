import classNames from "classnames";
import Block from "components/services/widget/block";
import Container from "components/services/widget/container";
import { useTranslation } from "next-i18next";

import useWidgetAPI from "utils/proxy/use-widget-api";

const MAX_PRICE_WATCHLIST_ITEMS = 28;
const MAX_SENTIMENT_WATCHLIST_ITEMS = 10;

function MarketStatus({ service }) {
  const { t } = useTranslation();
  const { widget } = service;

  const { data, error } = useWidgetAPI(widget, "status", {
    exchange: "US",
  });

  if (error || data?.error) {
    return <Container service={service} error={error} />;
  }

  if (!data) {
    return (
      <Container service={service}>
        <Block value={t("stocks.loading")} />
      </Container>
    );
  }

  const { isOpen } = data;

  if (isOpen) {
    return (
      <span className="inline-flex items-center rounded-md bg-green-500/10 px-2 py-1 text-xs font-medium text-green-400/90 ring-1 ring-inset ring-green-500/20">
        {t("stocks.open")}
      </span>
    );
  }

  return (
    <span className="inline-flex items-center rounded-md bg-red-400/10 px-2 py-1 text-xs font-medium text-red-400/60 ring-1 ring-inset ring-red-400/10">
      {t("stocks.closed")}
    </span>
  );
}

function StockItem({ service, ticker }) {
  const { t } = useTranslation();
  const { widget } = service;

  const { data, error } = useWidgetAPI(widget, "quote", { symbol: ticker });

  if (error || data?.error) {
    return <Container service={service} error={error} />;
  }

  if (!data) {
    return (
      <Container service={service}>
        <Block value={t("stocks.loading")} />
      </Container>
    );
  }

  return (
    <div className="bg-theme-200/50 dark:bg-theme-900/20 rounded-sm flex flex-1 items-center justify-between m-1 p-1 text-xs">
      <span className="font-thin ml-2 flex-none">{ticker}</span>
      <div className="flex items-center flex-row-reverse mr-2 text-right">
        <span className={`font-bold ml-2 w-10 ${data.dp > 0 ? "text-emerald-300" : "text-rose-300"}`}>
          {data.dp?.toFixed(2) ? `${data.dp?.toFixed(2)}%` : t("widget.api_error")}
        </span>
        <span className="font-bold">
          {data.c
            ? t("common.number", {
                value: data?.c,
                style: "currency",
                currency: "USD",
              })
            : t("widget.api_error")}
        </span>
      </div>
    </div>
  );
}

function sentimentValue(record, ...keys) {
  return keys.map((key) => record?.[key]).find((value) => value !== undefined && value !== null);
}

function normalizeSymbol(symbol) {
  return symbol?.toString().trim().toUpperCase().replace(/^\$/, "");
}

function sentimentByTicker(data) {
  const records = data?.stocks ?? data?.data ?? data?.results ?? [];
  return Object.fromEntries(
    records
      .map((record) => [normalizeSymbol(sentimentValue(record, "ticker", "symbol")), record])
      .filter(([ticker]) => ticker),
  );
}

function SentimentBadge({ record }) {
  const score = sentimentValue(record, "sentiment_score", "sentiment", "score");
  const buzz = sentimentValue(record, "buzz_score", "buzz");
  const numericBuzz = Number(buzz);

  if (score === undefined && buzz === undefined) {
    return null;
  }

  const numericScore = Number(score);
  const tone = numericScore >= 0 ? "text-emerald-300" : "text-rose-300";
  const formattedScore = Number.isNaN(numericScore) ? score : numericScore.toFixed(2);

  return (
    <span className={`font-bold ml-2 min-w-14 text-right ${Number.isNaN(numericScore) ? "" : tone}`}>
      {score !== undefined ? formattedScore : "-"}
      {buzz !== undefined && !Number.isNaN(numericBuzz) ? (
        <span className="font-thin ml-1 text-theme-500 dark:text-theme-400">/{numericBuzz.toFixed(0)}</span>
      ) : null}
    </span>
  );
}

function SentimentStockItem({ ticker, sentiment }) {
  const { t } = useTranslation();
  const record = sentiment?.[normalizeSymbol(ticker)];

  return (
    <div className="bg-theme-200/50 dark:bg-theme-900/20 rounded-sm flex flex-1 items-center justify-between m-1 p-1 text-xs">
      <span className="font-thin ml-2 flex-none">{ticker}</span>
      <div className="flex items-center mr-2 text-right">
        {record ? <SentimentBadge record={record} /> : <span className="font-bold ml-2">{t("widget.api_error")}</span>}
      </div>
    </div>
  );
}

export default function Component({ service }) {
  const { t } = useTranslation();
  const { widget } = service;
  const { sentimentDays, showSentiment, showUSMarketStatus, watchlist } = widget;
  const maxWatchlistItems = showSentiment === true ? MAX_SENTIMENT_WATCHLIST_ITEMS : MAX_PRICE_WATCHLIST_ITEMS;
  const validWatchlist =
    watchlist && watchlist.length && watchlist.length <= maxWatchlistItems && new Set(watchlist).size === watchlist.length;

  const { data: sentimentData, error: sentimentError } = useWidgetAPI(
    widget,
    validWatchlist && showSentiment === true ? "sentiment" : "",
    {
      tickers: watchlist?.join(",") ?? "",
      days: sentimentDays ?? 7,
    },
  );

  if (!validWatchlist) {
    return (
      <Container service={service}>
        <Block value={t("stocks.invalidConfiguration")} />
      </Container>
    );
  }

  if (showSentiment === true && (sentimentError || sentimentData?.error)) {
    return <Container service={service} error={sentimentError} />;
  }

  if (showSentiment === true && !sentimentData) {
    return (
      <Container service={service}>
        <Block value={t("stocks.loading")} />
      </Container>
    );
  }

  const sentiment = showSentiment === true ? sentimentByTicker(sentimentData) : null;

  return (
    <Container service={service}>
      <div className={classNames(service.description ? "-top-10" : "-top-8", "absolute right-1 z-20")}>
        {showUSMarketStatus === true && <MarketStatus service={service} />}
      </div>

      <div className="flex flex-col w-full">
        {watchlist.map((ticker) =>
          showSentiment === true ? (
            <SentimentStockItem key={ticker} ticker={ticker} sentiment={sentiment} />
          ) : (
            <StockItem key={ticker} service={service} ticker={ticker} />
          ),
        )}
      </div>
    </Container>
  );
}
