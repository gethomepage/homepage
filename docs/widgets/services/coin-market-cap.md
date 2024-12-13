---
title: Coin Market Cap
description: Coin Market Cap Widget Configuration
---

Learn more about [Coin Market Cap](https://coinmarketcap.com/api).

Get your API key from your [CoinMarketCap Pro Dashboard](https://pro.coinmarketcap.com/account).

Allowed fields: no configurable fields for this widget.

```yaml
widget:
  type: coinmarketcap
  currency: GBP # Optional
  symbols: [BTC, LTC, ETH]
  key: apikeyapikeyapikeyapikeyapikey
  defaultinterval: 7d # Optional
```

You can also specify slugs instead of symbols (since symbols aren't guaranteed to be unique). If you supply both, slugs will be used. For example:

```yaml
widget:
  type: coinmarketcap
  slugs: [chia-network, uniswap]
  key: apikeyapikeyapikeyapikeyapikey
```
