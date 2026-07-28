---
title: Maintainerr
description: Maintainerr Widget Configuration
---

Learn more about [Maintainerr](https://github.com/maintainerr/maintainerr).

Allowed fields: `["itemsHandled", "episodesHandled", "moviesHandled", "showsHandled", "seasonsHandled", "reclaimable", "movieReclaimable", "showReclaimable", "totalCapacity"]` (maximum of 4).

Default fields: `["itemsHandled", "episodesHandled", "moviesHandled", "reclaimable"]`.

```yaml
widget:
  type: maintainerr
  url: http://maintainerr.host.or.ip:port
  fields: ["itemsHandled", "episodesHandled", "moviesHandled", "reclaimable"] # optional
```
