---
title: Stocks
description: Stocks Service Widget Configuration
---

_(Find the Stocks information widget [here](../info/stocks.md))_

The widget supports:

- US stock market status (finnhub only)
- Current price of provided stock symbol
- Change in price of stock symbol for the day

Additionally, using Yahoo Finance as a provider, the widget additionally supports:

- International stocks
- Indices
- Forex
- Cryptocurrencies
- Commodities
- Futures
- Options


#### Finnhub.io

You can sign up for a free api key at [finnhub.io](https://finnhub.io).
You are encouraged to read finnhub.io's
[terms of service/privacy policy](https://finnhub.io/terms-of-service) before
signing up.

Allowed fields: no configurable fields for this widget.

You must set `finnhub` as a provider in your `settings.yaml`:

```yaml
providers:
  finnhub: yourfinnhubapikeyhere
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

#### Yahoo Finance
Yahoo Finance is a free provider and doesn't require any API key or authentication.
The API is not officially supported by Yahoo, so it may be subject to change or may be unreliable (e.g. rate limited).
Some data may be delayed for up to 15 minutes depending on the stock exchange.

You may use the quote lookup tool on the [Yahoo Finance website](https://finance.yahoo.com/) to find the symbol you are interested in.

Generally the following rules apply:
 - US stocks: `TICKER`
 - International stocks: `TICKER.STOCKEXCHANGE`
 - Indices: `^INDEX`
 - Forex: `TICKER=X`
 - Cryptocurrencies: `TICKER-CURRENCY`
 - Commodities/futures: `TICKER=F`
 - Options: `TICKERDATESTRIKE`

```yaml
widget:
  type: stocks
  provider: yahoofinance
  watchlist:
	- AAPL
	- LLOY.L
	- ^STOXX
	- JPY=X
	- BTC-EUR
	- GC=F
	- NQ=F
	- NVDA270115C00250000
```
