import { useTranslation } from "next-i18next";
import classNames from "classnames";

import Container from "components/services/widget/container";
import Block from "components/services/widget/block";
import useWidgetAPI from "utils/proxy/use-widget-api";

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

  let endpoint;
  let queryParams;
  if (widget.provider === "finnhub") {
    endpoint = "quote";
    queryParams = { symbol: ticker };
  } else if (widget.provider === "yahoofinance") {
    endpoint = ticker;
  }
  const { data, error } = useWidgetAPI(widget, endpoint, queryParams);

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

  let price;
  let change;
  let currency;
  if (widget.provider === "finnhub") {
    price = data.c;
    change = data.dp;
    currency = "USD"; // Finnhub free API only supports US based stocks
  } else if (widget.provider === "yahoofinance") {
    price = data.chart?.result[0]?.meta?.regularMarketPrice;
    const previousClose = data.chart?.result[0]?.meta?.chartPreviousClose;
    change = previousClose ? ((price - previousClose) / previousClose) * 100 : 0.0;
    currency = data.chart?.result[0]?.meta?.currency;
  }

  return (
    <div className="bg-theme-200/50 dark:bg-theme-900/20 rounded flex flex-1 items-center justify-between m-1 p-1 text-xs">
      <span className="font-thin ml-2 flex-none">{ticker}</span>
      <div className="flex items-center flex-row-reverse mr-2 text-right">
        <span className={`font-bold ml-2 w-10 ${change > 0 ? "text-emerald-300" : "text-rose-300"}`}>
          {change != null ? `${change.toFixed(2)}%` : t("widget.api_error")}
        </span>
        <span className="font-bold">
          {price != null
            ? t("common.number", {
                value: price,
                style: "currency",
                currency,
              })
            : t("widget.api_error")}
        </span>
      </div>
    </div>
  );
}

export default function Component({ service }) {
  const { t } = useTranslation();
  const { widget } = service;
  const { watchlist, showUSMarketStatus } = widget;

  if (!watchlist || !watchlist.length || watchlist.length > 28 || new Set(watchlist).size !== watchlist.length) {
    return (
      <Container service={service}>
        <Block value={t("stocks.invalidConfiguration")} />
      </Container>
    );
  }

  return (
    <Container service={service}>
      <div className={classNames(service.description ? "-top-10" : "-top-8", "absolute right-1 z-20")}>
        {showUSMarketStatus === true && widget.provider === "finnhub" && <MarketStatus service={service} />}
      </div>

      <div className="flex flex-col w-full">
        {watchlist.map((ticker) => (
          <StockItem key={ticker} service={service} ticker={ticker} />
        ))}
      </div>
    </Container>
  );
}
