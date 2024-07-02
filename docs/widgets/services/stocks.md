---
title: Stocks
description: Stocks Service Widget Configuration
---

_(Find the Stocks information widget [here](../info/stocks.md))_

The widget includes:

- US stock market status
- Current price of provided stock symbol
- Change in price of stock symbol for the day.

Finnhub.io is currently the only supported provider for the stocks widget.
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
