import useSWR from "swr";
import { useTranslation } from "react-i18next";
import getSymbolFromCurrency from "currency-symbol-map";

import Widget from "../widget";
import Block from "../block";

import { formatApiUrl } from "utils/api-helpers";

export default function CoinMarketCap({ service }) {
  const { t } = useTranslation();

  const config = service.widget;
  const symbols = [...service.symbols];
  const currencyCode = service.currency ?? "USD";

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

  return symbols.map((key) => (
    <Widget key={data[key].symbol}>
      <div className="bg-theme-200/50 dark:bg-theme-900/20 rounded m-1 flex-1 flex flex-row items-center justify-between p-1">
        <div className="font-thin text-sm">{data[key].name}</div>
        <div className="flex flex-col text-right">
          <div className="font-bold text-xs">
            {currencySymbol}
            {data[key].quote[currencyCode].price.toFixed(2)}
          </div>
          <div
            className={`font-bold text-xs ${
              data[key].quote[currencyCode].percent_change_1h > 0 ? "text-emerald-300" : "text-rose-300"
            }`}
          >
            {data[key].quote[currencyCode].percent_change_1h.toFixed(2)}%
          </div>
        </div>
      </div>
    </Widget>
  ));
}
