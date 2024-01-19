---
title: Coin Market Cap
description: Coin Market Cap Widget Configuration
---

[Coin Market Cap](https://coinmarketcap.com/api) - Track over 45,000+ active crypto markets and compare cryptocurrencies based on their price, market cap and volume.

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

You can also specify slugs instead of symbols (since symbols aren't garaunteed to be unique). If you supply both, slugs will be used. For example:

```yaml
widget:
  type: coinmarketcap
  slugs: [chia-network, uniswap]
  key: apikeyapikeyapikeyapikeyapikey
```
