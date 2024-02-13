---
title: Ghostfolio
description: Ghostfolio Widget Configuration
---

Learn more about [Ghostfolio](https://github.com/ghostfolio/ghostfolio).

Authentication requires manually obtaining a Bearer token which can be obtained by make a POST request to the API e.g.

```
curl -X POST http://localhost:3333/api/v1/auth/anonymous -H 'Content-Type: application/json' -d '{ "accessToken": "SECURITY_TOKEN_OF_ACCOUNT" }'
```

See the [official docs](https://github.com/ghostfolio/ghostfolio#authorization-bearer-token).

_Note that the Bearer token is valid for 6 months, after which a new one must be generated._

Allowed fields: `["gross_percent_today", "gross_percent_1y", "gross_percent_max"]`

```yaml
widget:
  type: ghostfolio
  url: http://ghostfoliohost:port
  key: ghostfoliobearertoken
```
