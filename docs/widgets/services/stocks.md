---
title: Stocks
description: Stocks Service Widget Configuration
---

_(Find the Stocks information widget [here](../info/stocks.md))_

The widget includes:

- US stock market status
- Current price of provided stock symbol
- Change in price of stock symbol for the day.
- Optional market sentiment from Adanos.

Finnhub.io is used for stock price quotes and market status.
You can sign up for a free api key at [finnhub.io](https://finnhub.io).
You are encouraged to read finnhub.io's
[terms of service/privacy policy](https://finnhub.io/terms-of-service) before
signing up.

Adanos can optionally be used to show sentiment and buzz scores for the same
watchlist. You can get access at
[api.adanos.org/docs](https://api.adanos.org/docs/).

Allowed fields: no configurable fields for this widget.

Set `finnhub` as a provider in your `settings.yaml` for price quote mode.
If you enable sentiment, set `adanos` instead. If you use sentiment together
with `showUSMarketStatus`, keep `finnhub` configured as well:

```yaml
providers:
  finnhub: yourfinnhubapikeyhere
  adanos: youradanosapikeyhere
```

Next, configure the stocks widget in your `services.yaml`:

The service widget allows for up to 28 items in the watchlist. You may get rate
limited if using the information and service widgets together.

```yaml
widget:
  type: stocks
  provider: finnhub
  showUSMarketStatus: true # optional, defaults to true
  watchlist:
    - GME
    - AMC
    - NVDA
    - TSM
    - BRK.A
    - TSLA
    - AAPL
    - MSFT
    - AMZN
    - BRK.B
```

To show Adanos sentiment instead of price quotes, enable `showSentiment`.
Sentiment is fetched in a single batch request for the configured watchlist.
Sentiment watchlists support up to 10 ticker symbols.

```yaml
widget:
  type: stocks
  showSentiment: true # optional, defaults to false
  sentimentSource: news_stocks # optional, defaults to reddit_stocks
  sentimentDays: 7 # optional, defaults to 7
  watchlist:
    - TSLA
    - NVDA
    - AAPL
```

Supported `sentimentSource` values are `reddit_stocks`, `x_stocks`,
`news_stocks`, and `polymarket_stocks`.
