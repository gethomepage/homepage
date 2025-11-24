import classNames from "classnames";
import Block from "components/services/widget/block";
import Container from "components/services/widget/container";
import { useTranslation } from "next-i18next";

import useWidgetAPI from "utils/proxy/use-widget-api";

function StockItem({ service, ticker }) {
  const { t } = useTranslation();
  const { widget } = service;

  const { data, error } = useWidgetAPI(widget, "quote", { symbol: ticker });

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
        <div className="bg-theme-200/50 dark:bg-theme-900/20 rounded-sm flex flex-1 items-center justify-between m-1 p-1 text-xs">
          <span className="font-thin ml-2 flex-none">{ticker}</span>
          <span className="font-bold mr-2 text-rose-300">{t("widget.api_error")}</span>
        </div>
      );
  }

  const price = result.regularMarketPrice;
  const close = result.chartPreviousClose;
  const changePercent = ((price - close) / close) * 100;

  return (
    <div className="bg-theme-200/50 dark:bg-theme-900/20 rounded-sm flex flex-1 items-center justify-between m-1 p-1 text-xs">
      <span className="font-thin ml-2 flex-none">{ticker}</span>
      <div className="flex items-center flex-row-reverse mr-2 text-right">
        <span className={`font-bold ml-2 w-10 ${changePercent > 0 ? "text-emerald-300" : "text-rose-300"}`}>
          {changePercent?.toFixed(2) ? `${changePercent?.toFixed(2)}%` : t("widget.api_error")}
        </span>
        <span className="font-bold">
          {price
            ? t("common.number", {
                value: price,
                style: "currency",
                currency: result.currency || "USD",
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
        {symbols.map((ticker) => (
          <StockItem key={ticker} service={service} ticker={ticker} />
        ))}
      </div>
    </Container>
  );
}
