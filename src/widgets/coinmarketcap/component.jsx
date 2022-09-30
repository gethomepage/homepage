import { useState } from "react";
import { useTranslation } from "next-i18next";
import classNames from "classnames";

import Container from "components/services/widget/container";
import Block from "components/services/widget/block";
import Dropdown from "components/services/dropdown";
import useWidgetAPI from "utils/proxy/use-widget-api";

export default function Component({ service }) {
  const { t } = useTranslation();

  const dateRangeOptions = [
    { label: t("coinmarketcap.1hour"), value: "1h" },
    { label: t("coinmarketcap.1day"), value: "24h" },
    { label: t("coinmarketcap.7days"), value: "7d" },
    { label: t("coinmarketcap.30days"), value: "30d" },
  ];

  const [dateRange, setDateRange] = useState(dateRangeOptions[0].value);

  const { widget } = service;
  const { symbols } = widget;
  const currencyCode = widget.currency ?? "USD";

  const { data: statsData, error: statsError } = useWidgetAPI(widget, "v1/cryptocurrency/quotes/latest", {
    symbol: `${symbols.join(",")}`,
    convert: `${currencyCode}`,
  });

  if (!symbols || symbols.length === 0) {
    return (
      <Container service={service}>
        <Block value={t("coinmarketcap.configure")} />
      </Container>
    );
  }

  if (statsError) {
    return <Container error={t("widget.api_error")} />;
  }

  if (!statsData || !dateRange) {
    return (
      <Container service={service}>
        <Block value={t("coinmarketcap.configure")} />
      </Container>
    );
  }

  const { data } = statsData;

  return (
    <Container service={service}>
      <div className={classNames(service.description ? "-top-10" : "-top-8", "absolute right-1")}>
        <Dropdown options={dateRangeOptions} value={dateRange} setValue={setDateRange} />
      </div>

      <div className="flex flex-col w-full">
        {symbols.map((symbol) => (
          <div
            key={data[symbol].symbol}
            className="bg-theme-200/50 dark:bg-theme-900/20 rounded m-1 flex-1 flex flex-row items-center justify-between p-1 text-xs"
          >
            <div className="font-thin pl-2">{data[symbol].name}</div>
            <div className="flex flex-row text-right">
              <div className="font-bold mr-2">
                {t("common.number", {
                  value: data[symbol].quote[currencyCode].price,
                  style: "currency",
                  currency: currencyCode,
                })}
              </div>
              <div
                className={`font-bold w-10 mr-2 ${
                  data[symbol].quote[currencyCode][`percent_change_${dateRange}`] > 0
                    ? "text-emerald-300"
                    : "text-rose-300"
                }`}
              >
                {data[symbol].quote[currencyCode][`percent_change_${dateRange}`].toFixed(2)}%
              </div>
            </div>
          </div>
        ))}
      </div>
    </Container>
  );
}
