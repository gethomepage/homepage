---
title: Wallos
description: Wallos Widget Configuration
---

Learn more about [Wallos](https://github.com/ellite/wallos).

If you're using more than one currency to record subscriptions then you should also have your "Fixer API" key set-up (`Settings > Fixer API Key`).

> **Please Note:** The monthly cost displayed is the total cost of subscriptions in that month, **not** the _"monthly"_ average cost.

Get your API key under `Profile > API Key`.

Allowed fields: `["activeSubscriptions", "nextRenewingSubscription", "previousMonthlyCost", "thisMonthlyCost", "nextMonthlyCost"]`.

Default fields: `["activeSubscriptions", "nextRenewingSubscription", "thisMonthlyCost", "nextMonthlyCost"]`.

```yaml
widget:
  type: wallos
  url: http://wallos.host.or.ip
  key: apikeyapikeyapikeyapikeyapikey
```
