---
title: Komodo
description: Komodo Widget Configuration
---

This widget shows either a summary of containers managed by [Komodo](https://komo.do/) or the number of running containers and stacks.

The api key and secret can be found in the Komodo settings.

Allowed fields without `showSummary` (max 4): `["total", "running", "stopped", "unhealthy", "unknown"]`.
Allowed fields with `showSummary`: `["stacks", "containers"]`.

```yaml
widget:
  type: komodo
  url: http://komodo.hostname.or.ip:port
  key: K-xxxxxx...
  secret: S-xxxxxx...
  showSummary: true # optional, default: false
```
