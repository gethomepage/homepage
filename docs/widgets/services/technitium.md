---
title: Technitium DNS Server
description: Technitium DNS Server Widget Configuration
---

Learn more about [Technitium DNS Server](https://technitium.com/dns/).

Allowed fields (up to 4): `["totalQueries","totalNoError","totalServerFailure","totalNxDomain","totalRefused","totalAuthoritative","totalRecursive","totalCached","totalBlocked","totalDropped","totalClients"]`.

Defaults to: `["totalQueries", "totalAuthoritative", "totalCached", "totalServerFailure"]`

```yaml
widget:
  type: technitium
  url: <url to dns server>
  key: biglongapitoken
  range: LastDay # optional, defaults to LastHour
```

#### API Key

This can be generated via the Technitium DNS Dashboard, and should be generated from a special API specific user.

#### Range

`range` value determines how far back of statistics to pull data for. The value comes directly from Technitium API documentation found [here](https://github.com/TechnitiumSoftware/DnsServer/blob/master/APIDOCS.md#dashboard-api-calls), defined as `"type"`. The value can be one of: `LastHour`, `LastDay`, `LastWeek`, `LastMonth`, `LastYear`.
