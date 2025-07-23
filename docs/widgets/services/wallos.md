---
title: Wallos
description: Wallos Widget Configuration
---

Learn more about [Wallos](https://github.com/ellite/wallos).

You'll need to have set-up and configured your Wallos instance already with at least one user and a "Main Currency" (`Profile > User Details > Main Currency`).

If you're using more than one currency to record subscriptions then you should also have your "Fixer API" key set-up (`Settings > Fixer API Key`).

> **Please Note:** The monthly cost displayed is what that month actually cost in that month. It is **not** the _"monthly"_ cost as an average of all subscriptions spread over 12 months.

Generate/Regenerate your API key under `Profile > API Key`.

Allowed fields: `["activeSubscriptions", "previousMonthlyCost", "thisMonthlyCost", "nextMonthlyCost"]`.

```yaml
widget:
  type: wallos
  url: http://wallos.host.or.ip
  key: apikeyapikeyapikeyapikeyapikey
```
