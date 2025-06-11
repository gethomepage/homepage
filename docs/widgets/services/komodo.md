---
title: Komodo
description: Komodo Widget Configuration
---

This widget shows either details about all containers or stacks (if `showStacks` is true) managed by [Komodo](https://komo.do/) or the number of running servers, containers and stacks when `showSummary` is enabled.

The api key and secret can be found in the Komodo settings.

Allowed fields (max 4): `["total", "running", "stopped", "unhealthy", "unknown"]`.
Allowed fields with `showStacks` (max 4): `["total", "running", "down", "unhealthy", "unknown"]`.
Allowed fields with `showSummary`: `["servers", "stacks", "containers"]`.

```yaml
widget:
  type: komodo
  url: http://komodo.hostname.or.ip:port
  key: K-xxxxxx...
  secret: S-xxxxxx...
  showSummary: true # optional, default: false
  showStacks: true # optional, default: false
```
