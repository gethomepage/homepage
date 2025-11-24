import classNames from "classnames";
import Block from "components/services/widget/block";
import Container from "components/services/widget/container";
import { useTranslation } from "next-i18next";

import useWidgetAPI from "utils/proxy/use-widget-api";

function StockItem({ service, item }) {
  const { t } = useTranslation();
  const { widget } = service;

  const symbol = typeof item === "string" ? item : item.symbol;
  const displayName = (typeof item === "object" && item.name) ? item.name : symbol;
  const range = (typeof item === "object" && item.range) ? item.range : "1d";

  const { data, error } = useWidgetAPI(widget, "quote", { symbol, range });

  if (error) {
    return <Container service={service} error={error} />;
  }

  if (!data) {
    return (
      <Container service={service}>
        <Block value={t("stocks.loading")} />
      </Container>
    );
  }

  const result = data?.chart?.result?.[0]?.meta;
  if (!result) {
      return (
        <div className="bg-theme-200/50 dark:bg-theme-900/20 rounded-sm flex flex-1 items-center justify-between m-1 p-2">
          <span className="font-thin ml-2 flex-none">{symbol}</span>
          <span className="font-bold mr-2 text-rose-300">{t("widget.api_error")}</span>
        </div>
      );
  }

  const price = result.regularMarketPrice;
  const close = result.chartPreviousClose;
  const changePercent = ((price - close) / close) * 100;

  return (
    <div className="bg-theme-200/50 dark:bg-theme-900/20 rounded-sm flex flex-1 items-center justify-between m-1 p-2">
      <div className="flex flex-col justify-center">
          <span className="font-bold text-sm text-theme-700 dark:text-theme-200">{displayName}</span>
          <div className="flex items-center gap-1">
            <span className="text-xs font-thin text-theme-500 dark:text-theme-400">{symbol}</span>
            <span className="text-[10px] text-theme-400 bg-theme-200/50 dark:bg-theme-800/50 px-1 rounded">{range.toUpperCase()}</span>
          </div>
      </div>
      <div className="flex flex-col items-end justify-center">
        <span className="font-bold text-sm text-theme-700 dark:text-theme-200">
          {price
            ? t("common.number", {
                value: price,
                style: "currency",
                currency: result.currency || "USD",
              })
            : t("widget.api_error")}
        </span>
        <span className={`text-xs font-bold ${changePercent > 0 ? "text-emerald-500 dark:text-emerald-400" : "text-rose-500 dark:text-rose-400"}`}>
          {changePercent > 0 ? "▲" : "▼"} {Math.abs(changePercent)?.toFixed(2)}%
        </span>
      </div>
    </div>
  );
}

export default function Component({ service }) {
  const { t } = useTranslation();
  const { widget } = service;
  const { symbols } = widget;

  if (!symbols || !symbols.length) {
    return (
      <Container service={service}>
        <Block value={t("stocks.invalidConfiguration")} />
      </Container>
    );
  }

  return (
    <Container service={service}>
      <div className="flex flex-col w-full">
        {symbols.map((item, index) => {
           const key = typeof item === "string" ? item : item.symbol + index;
           return <StockItem key={key} service={service} item={item} />;
        })}
      </div>
    </Container>
  );
}
