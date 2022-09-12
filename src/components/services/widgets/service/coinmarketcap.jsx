import useSWR from "swr";
import { useTranslation } from "react-i18next";
import getSymbolFromCurrency from "currency-symbol-map";

import Widget from "../widget";
import Block from "../block";

import { formatApiUrl } from "utils/api-helpers";

export default function CoinMarketCap({ service }) {
  const { t } = useTranslation();

  const config = service.widget;
  const currencyCode = config.currency ?? "USD";
  const { symbols } = config;

  const { data: statsData, error: statsError } = useSWR(
    formatApiUrl(config, `v1/cryptocurrency/quotes/latest?symbol=${symbols.join(",")}&convert=${currencyCode}`)
  );

  if (!symbols || symbols.length === 0) {
    return (
      <Widget>
        <Block value={t("coinmarketcap.configure")} />
      </Widget>
    );
  }

  if (statsError) {
    return <Widget error={t("widget.api_error")} />;
  }

  if (!statsData) {
    return (
      <Widget>
        <Block value={t("coinmarketcap.configure")} />
      </Widget>
    );
  }

  const { data } = statsData;
  const currencySymbol = getSymbolFromCurrency(currencyCode);

  return (
    <Widget>
      <div className="flex flex-col w-full">
        {symbols.map((key) => (
          <div
            key={data[key].symbol}
            className="bg-theme-200/50 dark:bg-theme-900/20 rounded m-1 flex-1 flex flex-row items-center justify-between p-1 text-xs"
          >
            <div className="font-thin pl-2">{data[key].name}</div>
            <div className="flex flex-row text-right">
              <div className="font-bold mr-2">
                {currencySymbol}
                {data[key].quote[currencyCode].price.toFixed(2)}
              </div>
              <div
                className={`font-bold w-10 mr-2 ${
                  data[key].quote[currencyCode].percent_change_1h > 0 ? "text-emerald-300" : "text-rose-300"
                }`}
              >
                {data[key].quote[currencyCode].percent_change_1h.toFixed(2)}%
              </div>
            </div>
          </div>
        ))}
      </div>
    </Widget>
  );
}
